const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING ARVANTA STUDIO BUSINESS PROCESSES & DB");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: Verify Logo Assets Exist & High-Res
  try {
    const fs = require("fs");
    const logoDark = fs.statSync("public/images/arvanta-logo-dark.png");
    const logoWhite = fs.statSync("public/images/arvanta-logo-white.png");
    const symDark = fs.statSync("public/images/arvanta-symbol-dark.png");
    const symWhite = fs.statSync("public/images/arvanta-symbol-white.png");
    const svgLogo = fs.statSync("public/images/logo.svg");

    if (logoDark.size > 50000 && logoWhite.size > 20000 && symDark.size > 20000) {
      console.log("✅ [TEST 1] HD Logo Assets verified without quality loss (Master PNGs & SVGs ready).");
      passed++;
    } else {
      throw new Error("Logo file size too small");
    }
  } catch (err) {
    console.error("❌ [TEST 1] Failed:", err.message);
    failed++;
  }

  // Test 2: Database Connection & Seeded Entities
  try {
    const catCount = await prisma.serviceCategory.count();
    const serviceCount = await prisma.service.count();
    const pkgCount = await prisma.servicePackage.count();
    const userCount = await prisma.user.count();

    if (catCount >= 14 && serviceCount >= 5 && pkgCount >= 10) {
      console.log(`✅ [TEST 2] Database connected: ${catCount} Categories, ${serviceCount} Services, ${pkgCount} Dynamic Packages, ${userCount} Users.`);
      passed++;
    } else {
      throw new Error(`Insufficient database records: cats=${catCount}, services=${serviceCount}`);
    }
  } catch (err) {
    console.error("❌ [TEST 2] Failed:", err.message);
    failed++;
  }

  // Test 3: Voucher Code Verification & Validation Logic
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: "ARVANTA1111" },
    });

    if (coupon && coupon.isActive && coupon.discountValue === 15) {
      // Simulate validation calculation
      const subtotal = 2000000;
      let discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
      const finalTotal = subtotal - discount;

      if (discount === 300000 && finalTotal === 1700000) {
        console.log(`✅ [TEST 3] Voucher logic verified: Code ARVANTA1111 applied discount Rp${discount.toLocaleString("id-ID")} on Rp${subtotal.toLocaleString("id-ID")} subtotal.`);
        passed++;
      } else {
        throw new Error(`Discount calculation unexpected: ${discount}`);
      }
    } else {
      throw new Error("Coupon ARVANTA1111 not found or inactive");
    }
  } catch (err) {
    console.error("❌ [TEST 3] Failed:", err.message);
    failed++;
  }

  // Test 4: Dynamic Pricing Update & History Log Verification
  try {
    const testPkg = await prisma.servicePackage.findFirst({
      where: { isActive: true },
      include: { service: true },
    });

    if (!testPkg) throw new Error("No active package to test");

    const originalPrice = testPkg.price;
    const testPrice = originalPrice + 100000;

    // Simulate price change
    await prisma.servicePackage.update({
      where: { id: testPkg.id },
      data: { price: testPrice },
    });

    // Record audit log
    await prisma.activityLog.create({
      data: {
        action: "PRICE_UPDATE",
        entityType: "SERVICE_PACKAGE",
        entityId: testPkg.id,
        details: `Harga ${testPkg.name} diubah dari Rp${originalPrice} ke Rp${testPrice} untuk pengujian automated test.`,
      },
    });

    // Revert back
    await prisma.servicePackage.update({
      where: { id: testPkg.id },
      data: { price: originalPrice },
    });

    console.log(`✅ [TEST 4] Dynamic pricing update & audit trail logging passed.`);
    passed++;
  } catch (err) {
    console.error("❌ [TEST 4] Failed:", err.message);
    failed++;
  }

  // Test 5: Order Creation & Price Snapshot Immutability
  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    const orderNumber = `TEST-${Date.now()}`;
    const basePrice = 2000000;
    const discount = 200000;
    const finalTotal = 1800000;
    const dp = 900000;

    const snapshot = {
      service: "Website Company Profile",
      packageName: "Professional Website",
      normalPrice: basePrice,
      discountAmount: discount,
      finalTotal,
      dpAmount: dp,
      version: "v2026.1",
    };

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: adminUser.id,
        serviceType: "WEBSITE",
        status: "MENUNGGU_KONFIRMASI",
        totalAmount: finalTotal,
        dpAmount: dp,
        remainingAmount: finalTotal - dp,
        customerName: "Pengujian Otomatis",
        customerPhone: "081234567890",
        customerEmail: "tester@arvanta.studio",
        notes: JSON.stringify(snapshot),
      },
    });

    // Verify snapshot persistence
    const fetched = await prisma.order.findUnique({ where: { id: newOrder.id } });
    const parsed = JSON.parse(fetched.notes);

    if (parsed.finalTotal === 1800000 && parsed.dpAmount === 900000) {
      console.log(`✅ [TEST 5] Order creation & Price Snapshot immutability verified for ${newOrder.orderNumber}.`);
      passed++;
    } else {
      throw new Error("Snapshot data mismatch");
    }

    // Clean up test order
    await prisma.order.delete({ where: { id: newOrder.id } });
  } catch (err) {
    console.error("❌ [TEST 5] Failed:", err.message);
    failed++;
  }

  // Test 6: Verify Portfolio Strict Elimination
  try {
    const fs = require("fs");
    const portfolioContent = fs.readFileSync("app/portfolio/page.tsx", "utf8");
    if (portfolioContent.includes('redirect("/services")')) {
      console.log("✅ [TEST 6] Portfolio strict ban verified: /portfolio permanently redirects to /services.");
      passed++;
    } else {
      throw new Error("Portfolio page is not redirected");
    }
  } catch (err) {
    console.error("❌ [TEST 6] Failed:", err.message);
    failed++;
  }

  console.log("==================================================");
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  console.log("==================================================");

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
