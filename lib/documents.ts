export function terbilang(n: number): string {
  n = Math.abs(Math.floor(n));
  if (n === 0) return "Nol Rupiah";

  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function spell(x: number): string {
    if (x < 12) return satuan[x];
    if (x < 20) return spell(x - 10) + " Belas";
    if (x < 100)
      return (
        spell(Math.floor(x / 10)) +
        " Puluh" +
        (x % 10 !== 0 ? " " + spell(x % 10) : "")
      );
    if (x < 200)
      return "Seratus" + (x % 100 !== 0 ? " " + spell(x % 100) : "");
    if (x < 1000)
      return (
        spell(Math.floor(x / 100)) +
        " Ratus" +
        (x % 100 !== 0 ? " " + spell(x % 100) : "")
      );
    if (x < 2000)
      return "Seribu" + (x % 1000 !== 0 ? " " + spell(x % 1000) : "");
    if (x < 1000000)
      return (
        spell(Math.floor(x / 1000)) +
        " Ribu" +
        (x % 1000 !== 0 ? " " + spell(x % 1000) : "")
      );
    if (x < 1000000000)
      return (
        spell(Math.floor(x / 1000000)) +
        " Juta" +
        (x % 1000000 !== 0 ? " " + spell(x % 1000000) : "")
      );
    if (x < 1000000000000)
      return (
        spell(Math.floor(x / 1000000000)) +
        " Milyar" +
        (x % 1000000000 !== 0 ? " " + spell(x % 1000000000) : "")
      );
    return (
      spell(Math.floor(x / 1000000000000)) +
      " Triliun" +
      (x % 1000000000000 !== 0 ? " " + spell(x % 1000000000000) : "")
    );
  }

  return spell(n).trim() + " Rupiah";
}

export const ROMAN_MONTHS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export const INDO_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export const INDO_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatIndoDate(dateInput?: Date | string | number | null) {
  let d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) d = new Date();

  const dayIndex = isNaN(d.getDay()) ? 1 : d.getDay();
  const dayName = INDO_DAYS[dayIndex] || "Senin";
  const day = isNaN(d.getDate()) ? 1 : d.getDate();
  const monthIndex = isNaN(d.getMonth()) ? 10 : Math.max(0, Math.min(11, d.getMonth()));
  const monthName = INDO_MONTHS[monthIndex] || "November";
  const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
  const romanMonth = ROMAN_MONTHS[monthIndex] || "XI";

  const padDay = String(day).padStart(2, "0");
  const padMonth = String(monthIndex + 1).padStart(2, "0");

  return {
    dayName,
    day,
    monthName,
    year,
    romanMonth,
    shortDate: `${padDay}/${padMonth}/${year}`,
    fullDate: `${day} ${monthName} ${year}`,
    formalStatement: `Pada hari ini, ${dayName}, tanggal ${day} bulan ${monthName} tahun ${year}, Arvanta Studio telah menerima sejumlah pembayaran secara sah dengan rincian sebagai berikut:`,
  };
}

export function extractSequence(orderNumber?: string | null): string {
  if (!orderNumber || typeof orderNumber !== "string") return "001";
  const match = orderNumber.match(/(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return String(num).padStart(3, "0");
  }
  return "001";
}

export function generateInvoiceNumber(orderNumber?: string | null, dateInput?: Date | string | null): string {
  let d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const seq = extractSequence(orderNumber);
  const monthIndex = isNaN(d.getMonth()) ? 10 : Math.max(0, Math.min(11, d.getMonth()));
  const roman = ROMAN_MONTHS[monthIndex] || "XI";
  const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
  return `${seq}/INV/ARV/${roman}/${year}`;
}

export function generateKuitansiNumber(orderNumber?: string | null, dateInput?: Date | string | null): string {
  let d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  const seq = extractSequence(orderNumber);
  const monthIndex = isNaN(d.getMonth()) ? 10 : Math.max(0, Math.min(11, d.getMonth()));
  const roman = ROMAN_MONTHS[monthIndex] || "XI";
  const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
  return `${seq}/KUI/ARV/${roman}/${year}`;
}

export interface InvoiceLineItem {
  no: number;
  description: string;
  qty: string;
  unitPrice: number;
  totalPrice: number;
}

export function buildInvoiceLineItems(order: any): InvoiceLineItem[] {
  if (!order) return [];
  const total = Number(order.totalAmount) || 0;

  // If order items exist in DB
  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    return order.items.map((item: any, idx: number) => ({
      no: idx + 1,
      description: item.productName || item.servicePackage?.name || "Layanan Arvanta Studio",
      qty: `${item.quantity || 1} Paket`,
      unitPrice: Number(item.unitPrice || item.totalPrice) || total,
      totalPrice: Number(item.totalPrice || item.unitPrice) || total,
    }));
  }

  // Smart structured line items based on service type
  if (order.serviceType === "WEBSITE") {
    const packageName = order.websiteType || "Website Custom & Sistem Digital";
    // Professional 4-component breakdown summing to total
    const item1Price = Math.round((total * 0.55) / 10000) * 10000;
    const item2Price = Math.round((total * 0.25) / 10000) * 10000;
    const item3Price = Math.round((total * 0.1) / 10000) * 10000;
    const item4Price = Math.max(0, total - (item1Price + item2Price + item3Price));

    return [
      {
        no: 1,
        description: `Jasa Pengembangan Sistem & Pembuatan Website Custom (${packageName})`,
        qty: "1 Paket",
        unitPrice: item1Price,
        totalPrice: item1Price,
      },
      {
        no: 2,
        description: "Desain Antarmuka (UI/UX Responsive) & Integrasi Basis Data",
        qty: "1 Paket",
        unitPrice: item2Price,
        totalPrice: item2Price,
      },
      {
        no: 3,
        description: "Biaya Infrastruktur Pihak Ketiga (Registrasi Nama Domain & Server Cloud)",
        qty: "1 Tahun",
        unitPrice: item3Price,
        totalPrice: item3Price,
      },
      {
        no: 4,
        description: "Konfigurasi Server, Deployment Sistem & Jaminan Garansi (2 Bulan)",
        qty: "1 Paket",
        unitPrice: item4Price,
        totalPrice: item4Price,
      },
    ];
  }

  // Graphic design breakdown
  const designName = order.designConcept || order.designSize || "Graphic Design & Branding";
  const item1Price = Math.round((total * 0.7) / 10000) * 10000;
  const item2Price = Math.max(0, total - item1Price);

  return [
    {
      no: 1,
      description: `Jasa Pembuatan Desain Grafis & Identitas Branding (${designName})`,
      qty: `${order.designQuantity || 1} Item`,
      unitPrice: item1Price,
      totalPrice: item1Price,
    },
    {
      no: 2,
      description: "Penyiapan Berkas Master Resolusi Tinggi (Export File AI, PDF, PNG, SVG)",
      qty: "1 Paket",
      unitPrice: item2Price,
      totalPrice: item2Price,
    },
  ];
}
