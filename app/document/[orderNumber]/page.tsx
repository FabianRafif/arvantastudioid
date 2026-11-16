import OrderDocumentViewer from "@/components/OrderDocumentViewer";

export const metadata = {
  title: "Faktur Invoice & Kuitansi Resmi | Arvanta Studio",
  description: "Dokumen resmi faktur tagihan dan bukti kuitansi pembayaran Arvanta Studio.",
};

export default async function PublicOrderDocumentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <OrderDocumentViewer
      orderIdOrNumber={orderNumber}
      backUrl="/"
      role="CUSTOMER"
    />
  );
}
