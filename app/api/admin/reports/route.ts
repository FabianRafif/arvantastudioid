import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "ALL";

    let dateFilter: any = {};
    const now = new Date();

    if (period === "TODAY") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { createdAt: { gte: startOfDay } };
    } else if (period === "7DAYS") {
      const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: past7 } };
    } else if (period === "30DAYS") {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: past30 } };
    }

    const [orders, verifiedPayments, pendingPayments, customersCount] = await Promise.all([
      prisma.order.findMany({
        where: dateFilter,
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: {
          status: "VERIFIED",
          ...dateFilter,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: "PENDING",
          ...dateFilter,
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    // Financial Metrics
    // 1. Total Gross Order Value (Total Omzet Komitmen Pesanan)
    const totalGrossOmzet = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    // 2. Real Cash Received (Uang Kas Masuk Terverifikasi)
    const verifiedCashReceived = verifiedPayments.reduce((acc, p) => acc + p.amount, 0);

    // 3. Accounts Receivable (Piutang Belum Dilunasi)
    const pendingReceivables = orders.reduce((acc, o) => acc + o.remainingAmount, 0);

    // Package Popularity Map
    const packageStats: { [name: string]: { count: number; revenue: number } } = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!packageStats[item.name]) {
          packageStats[item.name] = { count: 0, revenue: 0 };
        }
        packageStats[item.name].count += item.quantity || 1;
        packageStats[item.name].revenue += item.subtotal || item.price;
      });
    });

    const popularPackages = Object.entries(packageStats).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    })).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      period,
      summary: {
        totalGrossOmzet,
        verifiedCashReceived,
        pendingReceivables,
        totalOrdersCount: orders.length,
        totalCustomersCount: customersCount,
      },
      popularPackages,
      recentOrders: orders.slice(0, 15).map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        serviceType: o.serviceType,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
