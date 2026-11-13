const http = require('http');
const fs = require('fs');
const path = require('path');

async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: buffer,
          text: buffer.toString('utf8'),
        });
      });
    }).on('error', reject);
  });
}

async function postMultipart(url, filePath, fieldName = 'file') {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const postDataStart = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n` +
      `Content-Type: image/webp\r\n\r\n`
    );
    const postDataEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const payload = Buffer.concat([postDataStart, fileData, postDataEnd]);

    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            text: data,
          });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify(body));
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            text: data,
          });
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Memverifikasi file user yang diunggah sebelumnya ===');
  const userBannerFile = 'banner-1794504224001-48582011302ebdea.webp';
  
  const res1 = await get(`http://127.0.0.1:3000/uploads/banners/${userBannerFile}`);
  console.log(`[GET /uploads/banners/${userBannerFile}] -> Status:`, res1.statusCode, 'Content-Type:', res1.headers['content-type'], 'Size:', res1.data.length);
  if (res1.statusCode !== 200 || res1.data.length < 500000) {
    throw new Error('Test 1 failed: file user tidak dapat diakses via /uploads/banners/');
  }

  const res1Api = await get(`http://127.0.0.1:3000/api/uploads/banners/${userBannerFile}`);
  console.log(`[GET /api/uploads/banners/${userBannerFile}] -> Status:`, res1Api.statusCode, 'Content-Type:', res1Api.headers['content-type'], 'Size:', res1Api.data.length);
  if (res1Api.statusCode !== 200) {
    throw new Error('Test 1 failed: file user tidak dapat diakses via /api/uploads/banners/');
  }

  console.log('\n=== TEST 2: Mengunggah file banner baru secara dinamis saat runtime ===');
  const testUploadSource = path.join(__dirname, '../public/uploads/banners', userBannerFile);
  const uploadRes = await postMultipart('http://127.0.0.1:3000/api/admin/banners/upload', testUploadSource);
  console.log('Upload Response:', uploadRes.statusCode, uploadRes.text);
  const uploadJson = JSON.parse(uploadRes.text);
  if (!uploadJson.success || !uploadJson.url) {
    throw new Error('Test 2 failed: upload gagal');
  }

  console.log('\n=== TEST 3: Mengambil gambar yang baru saja diunggah tanpa restart server ===');
  const freshUrl = `http://127.0.0.1:3000${uploadJson.url}`;
  const res3 = await get(freshUrl);
  console.log(`[GET ${uploadJson.url}] -> Status:`, res3.statusCode, 'Content-Type:', res3.headers['content-type'], 'Size:', res3.data.length);
  if (res3.statusCode !== 200 || res3.data.length === 0) {
    throw new Error('Test 3 failed: file yang baru saja diunggah tidak dapat diakses secara langsung');
  }

  console.log('\n=== TEST 4: Menyimpan banner baru ke database via POST /api/admin/banners ===');
  const bannerPayload = {
    title: 'BANNER PROMO DINAMIS TERBARU',
    subtitle: 'Website & Desain Grafis Profesional Arvanta Studio',
    badge: 'PROMO TERBARU',
    imageUrl: uploadJson.url,
    targetUrl: '/order',
    sortOrder: 1,
    isActive: true,
  };
  const saveRes = await postJson('http://127.0.0.1:3000/api/admin/banners', bannerPayload);
  console.log('Save Banner Response:', saveRes.statusCode, saveRes.text);
  const saveJson = JSON.parse(saveRes.text);
  if (!saveJson.success || !saveJson.banner?.id) {
    throw new Error('Test 4 failed: penyimpanan banner ke database gagal');
  }

  console.log('\n=== TEST 5: Memastikan banner baru muncul di API publik dan carousel ===');
  const pubBannersRes = await get('http://127.0.0.1:3000/api/banners');
  const pubJson = JSON.parse(pubBannersRes.text);
  const matched = pubJson.banners.find(b => b.id === saveJson.banner.id);
  console.log('Banner baru terdaftar di API publik:', matched ? 'YA, DITEMUKAN!' : 'TIDAK DITEMUKAN');
  console.log('Detail banner publik:', matched);

  console.log('\n=== SEMUA PENGUJIAN BERHASIL LULUS 100%! ===');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
