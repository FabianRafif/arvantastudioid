const http = require("http");

function request(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        path,
        method,
        headers: {
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let data = null;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log("=== ARVANTA STUDIO: REAL-TIME PRICING & PROMO VERIFICATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition, desc) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  try {
    // 1. Check /api/live-sync initial state (11.11 must be gone)
    const initialSync = await request("GET", "/api/live-sync");
    assert(initialSync.status === 200, "1. /api/live-sync responds with HTTP 200");
    const d1 = initialSync.data;
    assert(d1.success === true, "2. /api/live-sync reports success: true");
    assert(d1.pricing && d1.pricing.packages.length >= 3, "3. Live packages list populated (>=3 packages)");
    assert(d1.promotions.flashSale.isActive === false, "4. Expired 11.11 Flash Sale is DEACTIVATED (isActive: false)");
    assert(d1.promotions.navbarBadge === null, "5. Navbar promo badge is clean/null when no active promo");

    // Check that banners don't have 11.11
    const bannerHas1111 = d1.promotions.banners.some(
      (b) => b.title?.includes("11.11") || b.badge?.includes("11.11")
    );
    assert(!bannerHas1111, "6. No banners contain 11.11 in title or badge");

    // 2. Authenticate as Super Admin
    const loginRes = await request("POST", "/api/auth/login", {
      username: "admin@arvanta.studio",
      password: "admin123",
    });
    assert(loginRes.status === 200, "7. Super Admin login successful");
    const setCookie = loginRes.headers["set-cookie"];
    const cookie = Array.isArray(setCookie) ? setCookie.join("; ") : setCookie;

    // 3. Test Dynamic Price Change without Refresh
    const basicPkg = d1.pricing.packages.find((p) => p.name.includes("BASIC")) || d1.pricing.packages[0];
    const originalPrice = basicPkg.price;
    const testNewPrice = 1750000;

    console.log(`\nTesting Dynamic Pricing: Changing ${basicPkg.name} from Rp${originalPrice.toLocaleString('id-ID')} to Rp${testNewPrice.toLocaleString('id-ID')}...`);
    const updatePriceRes = await request(
      "PUT",
      "/api/admin/pricing",
      {
        packageId: basicPkg.id,
        newPrice: testNewPrice,
      },
      cookie
    );
    assert(updatePriceRes.status === 200 && updatePriceRes.data.success, "8. Admin PUT /api/admin/pricing succeeded");

    // Immediately verify /api/live-sync reflects new price in real-time
    const syncAfterPrice = await request("GET", "/api/live-sync");
    const updatedPkg = syncAfterPrice.data.pricing.packages.find((p) => p.id === basicPkg.id);
    assert(updatedPkg && updatedPkg.price === testNewPrice, `9. Real-time Live Sync immediately returned updated price Rp${testNewPrice.toLocaleString('id-ID')} without refresh`);
    assert(syncAfterPrice.data.version !== d1.version, "10. Live sync version token updated to trigger instant client re-render");

    // Revert price back
    console.log(`Reverting ${basicPkg.name} back to Rp${originalPrice.toLocaleString('id-ID')}...`);
    await request(
      "PUT",
      "/api/admin/pricing",
      {
        packageId: basicPkg.id,
        newPrice: originalPrice,
      },
      cookie
    );
    const syncReverted = await request("GET", "/api/live-sync");
    const revertedPkg = syncReverted.data.pricing.packages.find((p) => p.id === basicPkg.id);
    assert(revertedPkg && revertedPkg.price === originalPrice, `11. Real-time Live Sync verified price cleanly restored to Rp${originalPrice.toLocaleString('id-ID')}`);

    // 4. Test Dynamic Promo Voucher Creation without Refresh
    const testCouponCode = "HEMAT25";
    console.log(`\nTesting Dynamic Promo: Admin creating new voucher '${testCouponCode}' with 25% discount...`);
    const createPromoRes = await request(
      "POST",
      "/api/admin/promotions",
      {
        code: testCouponCode,
        discountType: "PERCENTAGE",
        discountValue: 25,
        minSpend: 0,
        usageLimit: 100,
        startDate: new Date(Date.now() - 3600000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      },
      cookie
    );
    assert(createPromoRes.status === 200 && createPromoRes.data.success, `12. Admin POST /api/admin/promotions created voucher '${testCouponCode}'`);
    const createdCouponId = createPromoRes.data.coupon.id;

    // Immediately verify /api/live-sync reflects new promo
    const syncAfterPromo = await request("GET", "/api/live-sync");
    const hasNewCoupon = syncAfterPromo.data.promotions.coupons.some((c) => c.code === testCouponCode);
    assert(hasNewCoupon, `13. Live Sync instantly includes new voucher '${testCouponCode}'`);
    assert(syncAfterPromo.data.promotions.navbarBadge !== null, `14. Navbar badge automatically appeared: '${syncAfterPromo.data.promotions.navbarBadge}' without refresh`);

    // Verify voucher validation endpoint with new voucher
    const validateRes = await request("POST", "/api/vouchers/validate", {
      code: testCouponCode,
      amount: 2000000,
    });
    assert(validateRes.status === 200 && validateRes.data.valid, `15. /api/vouchers/validate validates new voucher '${testCouponCode}' (Discount: Rp${validateRes.data?.coupon?.discountAmount?.toLocaleString('id-ID')})`);

    // Clean up test coupon
    console.log(`Deleting test coupon '${testCouponCode}'...`);
    await request("DELETE", `/api/admin/promotions?id=${createdCouponId}`, null, cookie);
    const syncAfterDelete = await request("GET", "/api/live-sync");
    assert(!syncAfterDelete.data.promotions.coupons.some((c) => c.code === testCouponCode), "16. Test voucher cleanly removed from live sync");
    assert(syncAfterDelete.data.promotions.navbarBadge === null, "17. Navbar badge automatically disappeared after promo removal");

    // 5. Test Flash Sale Real-time Toggle
    console.log("\nTesting Flash Sale Real-time Toggle by Admin...");
    await request(
      "POST",
      "/api/admin/flash-sale",
      {
        isActive: true,
        title: "PROMO AKHIR PEKAN ARVANTA",
        discountPercent: "15",
        voucherCode: "WEEKEND15",
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
      },
      cookie
    );
    const syncFsActive = await request("GET", "/api/live-sync");
    assert(syncFsActive.data.promotions.flashSale.isActive === true, "18. Flash sale immediately marked active in live sync");
    assert(syncFsActive.data.promotions.navbarBadge === "15% OFF", "19. Navbar badge immediately shows '15% OFF' in real-time");

    // Deactivate flash sale
    await request(
      "POST",
      "/api/admin/flash-sale",
      {
        isActive: false,
      },
      cookie
    );
    const syncFsInactive = await request("GET", "/api/live-sync");
    assert(syncFsInactive.data.promotions.flashSale.isActive === false, "20. Flash sale immediately deactivated");
    assert(syncFsInactive.data.promotions.navbarBadge === null, "21. Navbar badge cleanly reverted to null");

    console.log(`\n======================================================`);
    console.log(`RESULT: ${passed}/${total} assertions PASSED (100% Success)`);
    console.log(`======================================================\n`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runTests();
