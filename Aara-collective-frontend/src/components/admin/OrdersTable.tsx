import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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

type Props = {
  orders: Order[];
};

const OrdersTable = ({ orders }: Props) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium text-pink-600">
                #{order.id}
              </TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell className="text-gray-500">{order.date}</TableCell>
              <TableCell>{order.amount}</TableCell>
              <TableCell>
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {order.status}
                </span>
              </TableCell>
              <TableCell className="text-gray-500">{order.items}</TableCell>
              <TableCell className="text-right">
                <Link
                  to={`/admin/orders/${order.id}`}
                  className="text-pink-600 hover:text-pink-900"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
