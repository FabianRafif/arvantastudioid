import OrderDocumentViewer from "@/components/OrderDocumentViewer";

export default async function AdminOrderDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <OrderDocumentViewer
      orderIdOrNumber={id}
      backUrl={`/admin/orders/${id}`}
      role="ADMIN"
    />
  );
}
