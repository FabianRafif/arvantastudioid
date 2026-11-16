"use client";

import { use } from "react";
import OrderDocumentViewer from "@/components/OrderDocumentViewer";

export default function AdminOrderDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <OrderDocumentViewer
      orderIdOrNumber={id}
      backUrl={`/admin/orders/${id}`}
      role="ADMIN"
    />
  );
}
