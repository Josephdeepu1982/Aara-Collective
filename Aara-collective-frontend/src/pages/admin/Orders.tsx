import React, { useEffect, useState } from "react";
import OrdersTable from "@/components/admin/OrdersTable";

type Order = {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: string;
  items: number;
  email: string;
  phone: string;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err?.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading orders...</p>;
  }
  if (error) {
    return (
      <div className="p-6 text-sm text-red-600 space-y-2">
        <p>
          <strong>Could not load orders.</strong>
        </p>
        <pre className="whitespace-pre-wrap bg-red-50 p-3 rounded">{error}</pre>
        <p className="text-gray-600">
          Tip: ensure you're signed in, have role <code>admin</code>, and that
          cookies are allowed.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Orders</h1>
      <OrdersTable orders={orders} />
    </div>
  );
};

export default OrdersPage;
