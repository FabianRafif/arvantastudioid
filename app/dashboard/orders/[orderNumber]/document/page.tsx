"use client";

import { use } from "react";
import OrderDocumentViewer from "@/components/OrderDocumentViewer";

export default function CustomerOrderDocumentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);

  return (
    <OrderDocumentViewer
      orderIdOrNumber={orderNumber}
      backUrl={`/dashboard/orders/${orderNumber}`}
      role="CUSTOMER"
    />
  );
}
