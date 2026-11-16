import OrderDocumentViewer from "@/components/OrderDocumentViewer";

export default async function CustomerOrderDocumentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <OrderDocumentViewer
      orderIdOrNumber={orderNumber}
      backUrl={`/dashboard/orders/${orderNumber}`}
      role="CUSTOMER"
    />
  );
}
