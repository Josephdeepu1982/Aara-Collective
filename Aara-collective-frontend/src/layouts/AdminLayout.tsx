import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumb from "@/components/admin/Breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {};

const AdminLayout = (props: Props) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-screen my-20">
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white shadow-sm z-10 relative">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <Breadcrumb />
              </div>

              <p className="text-sm text-gray-700">
                Logged in as <span className="font-medium">Admin</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
