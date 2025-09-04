import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from "lucide-react";

type Customer = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
};

type ShippingAddress = {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type Product = {
  id: string;
  name: string;
};

type OrderItem = {
  id: string;
  productId: string;
  name?: string;
  unitPriceCents: number;
  quantity: number;
  image?: string;
  product?: Product;
};

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
  customerId?: string;
  email?: string;
  phone?: string;
  shippingAddressId?: string;
  customer?: Customer;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
};

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = (cents: number) =>
    new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
    }).format(cents / 100);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch order from frontend
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/orders/${id}`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err || "Something went wrong while loading order.");
        setError("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  //Update Order
  const updateOrder = async (updates: Partial<Order>) => {
    if (!id) return;
    setUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updated = await res.json();
      setOrder(updated);
    } catch (error) {
      console.error(error || "Update failed.");
      setError("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  //Delete Order
  const deleteOrder = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      await res.json();
      navigate("/admin/orders");
    } catch (error) {
      console.error(error || "Delete failed.");
      setError("Failed to delete order");
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-40 w-full bg-gray-200 rounded"></div>
      </div>
    );
  }
  if (!order) return <p className="p-6">Order not found.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Error Message */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/orders"
              className="text-pink-600 hover:text-pink-800"
            >
              <ArrowLeftIcon className="h-7 w-7 bg-gray-200 rounded hover:bg-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id}
            </h1>
            {/* Status Badge */}
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                order.status,
              )}`}
            >
              {order.status}
            </span>
            {/* Payment Status Badge
            <span
              className={`ml-2 px-2 py-1 text-xs rounded-full ${
                order.paymentStatus === "SUCCEEDED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.paymentStatus}
            </span> */}
          </div>
          <p className="text-gray-500 mt-1 pl-9">
            Order placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateOrder({ paymentStatus: "SUCCEEDED" })}
            disabled={updating || order.paymentStatus === "SUCCEEDED"}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md 
             text-white bg-yellow-600 hover:bg-yellow-700 
             disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <CreditCardIcon className="h-4 w-4 mr-1" />
            Mark Paid
          </button>
          <button
            onClick={() =>
              updateOrder({ status: "SHIPPED", paymentStatus: "SUCCEEDED" })
            }
            disabled={
              updating ||
              order.status === "SHIPPED" ||
              order.status === "DELIVERED"
            }
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md 
             text-white bg-purple-600 hover:bg-purple-700 
             disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <TruckIcon className="h-4 w-4 mr-1" />
            Mark Shipped
          </button>
          <button
            onClick={() =>
              updateOrder({ status: "DELIVERED", paymentStatus: "SUCCEEDED" })
            }
            disabled={updating || order.status === "DELIVERED"}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md 
             text-white bg-green-600 hover:bg-green-700 
             disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" /> Mark Delivered
          </button>
          <button
            onClick={deleteOrder}
            className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info & Shipping */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Customer Information
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>Name: {order.customer?.name}</p>
              <p>Email: {order.customer?.email}</p>
              <p>Phone: {order.shippingAddress?.phone ?? "N/A"}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Shipping Address
            </h2>
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">{item.product?.name}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">
                        {item.unitPriceCents !== undefined
                          ? price(item.unitPriceCents)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{price(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{price(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{price(order.discountCents)}</span>
              </div>
              <div className="border-t pt-3 mt-3 font-semibold flex justify-between">
                <span>Total</span>
                <span className="text-pink-600">{price(order.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Payment Information
            </h2>
            <div className="space-y-3">
              <p>Status: {order.paymentStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
