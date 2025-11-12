import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  MenuIcon,
  Home,
  DollarSign,
  FileClock,
  LogOut,
  BookCheck,
  CalendarCheck2,
  Heart,
  BookUser,
  Users,
  IdCard,
  LayoutGrid
} from "lucide-react";
import { useAuth } from "../hooks/use-auth"

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, items }) => {
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarClasses = sidebarOpen ? "w-64" : "w-20";
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-linear-to-b from-gray-50 to-gray-100 text-gray-800 shadow-md transition-all duration-300",
        "h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400",
        sidebarClasses
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
        {sidebarOpen && (
          <h1 className="text-xl font-semibold tracking-wide text-gray-700">
            Painel
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 hover:bg-gray-200"
        >
          <MenuIcon className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-3 mt-2">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl font-medium text-gray-700 transition-all duration-200",
              "hover:bg-gray-200 hover:text-gray-900 group"
            )}
          >
            <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition">
              <item.icon className="h-4 w-4 text-gray-600 group-hover:text-gray-800" />
            </div>
            {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200 p-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-2 w-full rounded-xl text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 transition">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          {sidebarOpen && <span className="truncate text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};


import { useState } from "react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? "ml-64" : "ml-20";

  const sidebarItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/members", label: "Membros", icon: BookUser },
    { href: "/families", label: "Famílias", icon: Heart },
    { href: "/groups", label: "Grupos", icon: Users },
    { href: "/ministries", label: "Ministerios", icon: LayoutGrid },
    { href: "/finances", label: "finanças", icon: DollarSign },
    { href: "/communication", label: "Comunicação", icon: FileClock },
    { href: "/volunteers", label: "voluntários", icon: IdCard },
    { href: "/inventory", label: "Patrimônio", icon: BookCheck },
    { href: "/checkin", label: "Check-in Eventos", icon: CalendarCheck2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 h-screen z-50">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          items={sidebarItems}
        />
      </div>

      <main
        className={`${sidebarWidth} flex-1 overflow-auto transition-all duration-300 p-6`}
      >
        {children}
      </main>
    </div>
  );
}
