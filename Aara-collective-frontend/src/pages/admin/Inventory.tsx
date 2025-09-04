import React from "react";

type Props = {};

const InventoryPage = (props: Props) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      <p className="text-gray-600 mt-2">Manage your product stock levels</p>
    </div>
  );
};

export default InventoryPage;
