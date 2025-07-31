"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Heart,
  User,
  Settings,
  Building,
  FileText,
  Users,
  BarChart3,
  MessageCircle,
  Wrench,
  CreditCard,
  Bell,
  FolderOpen,
  Calendar,
} from "lucide-react";

interface AppSidebarProps {
  userType: "tenant" | "manager";
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userType }) => {
  const pathname = usePathname();

  const tenantLinks = [
    {
      title: "Dashboard",
      href: "/tenants/residences",
      icon: Home,
    },
    {
      title: "Favorites",
      href: "/tenants/favorites",
      icon: Heart,
    },
    {
      title: "Applications",
      href: "/tenants/applications",
      icon: FileText,
    },
    {
      title: "Payments",
      href: "/tenants/payments",
      icon: CreditCard,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageCircle,
    },
    {
      title: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
    },
    {
      title: "Scheduled Maintenance",
      href: "/maintenance/scheduled",
      icon: Calendar,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Settings",
      href: "/tenants/settings",
      icon: Settings,
    },
  ];

  const managerLinks = [
    {
      title: "Dashboard",
      href: "/managers/properties",
      icon: Home,
    },
    {
      title: "Properties",
      href: "/managers/properties",
      icon: Building,
    },
    {
      title: "Applications",
      href: "/managers/applications",
      icon: FileText,
    },
    {
      title: "Tenants",
      href: "/managers/tenants",
      icon: Users,
    },
    {
      title: "Analytics",
      href: "/managers/analytics",
      icon: BarChart3,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageCircle,
    },
    {
      title: "Maintenance",
      href: "/maintenance",
      icon: Wrench,
    },
    {
      title: "Scheduled Maintenance",
      href: "/maintenance/scheduled",
      icon: Calendar,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FolderOpen,
    },
    {
      title: "Settings",
      href: "/managers/settings",
      icon: Settings,
    },
  ];

  const links = userType === "tenant" ? tenantLinks : managerLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {userType === "tenant" ? "Tenant Portal" : "Manager Portal"}
        </h2>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AppSidebar;
