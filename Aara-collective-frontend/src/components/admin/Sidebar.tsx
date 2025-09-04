import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  BarChart2,
  RefreshCcw,
  Settings,
  Truck,
  Layers,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Props = {};

const AdminSidebar = (props: Props) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: Tag,
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: Layers,
    },
    {
      name: "Returns",
      path: "/admin/returns",
      icon: RefreshCcw,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart2,
    },
    {
      name: "Shipping",
      path: "/admin/shipping",
      icon: Truck,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="h-screen sticky top-0 shadow-md">
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup >
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                {/* <SidebarMenuButton asChild> */}
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-pink-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </NavLink>
                {/* </SidebarMenuButton> */}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
