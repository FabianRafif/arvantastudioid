import OrderDocumentViewer from "@/components/OrderDocumentViewer";
import { prisma } from "@/lib/prisma";

export default async function CustomerOrderDocumentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const cleanId = decodeURIComponent(orderNumber).trim();

  let initialOrder = null;
  try {
    const found = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: cleanId }, { id: cleanId }],
      },
      include: {
        items: {
          include: {
            servicePackage: true,
            designCatalog: true,
          },
        },
        invoices: true,
      },
    });

    if (found) {
      let cleanNotes = "-";
      if (found.notes) {
        if (found.notes.includes("--- SNAPSHOT HARGA TERKUNCI ---")) {
          const parts = found.notes.split("--- SNAPSHOT HARGA TERKUNCI ---");
          const clientPart = parts[0].trim();
          cleanNotes = clientPart && clientPart !== "-" ? clientPart : "-";
        } else if (found.notes.trim() && found.notes.trim() !== "-") {
          cleanNotes = found.notes.trim();
        }
      }

      initialOrder = {
        ...found,
        notes: cleanNotes,
        businessName: found.businessName || "-",
      };
    }
  } catch {}

  return (
    <OrderDocumentViewer
      orderIdOrNumber={orderNumber}
      backUrl={`/dashboard/orders/${orderNumber}`}
      role="CUSTOMER"
      initialOrder={initialOrder}
    />
  );
}
