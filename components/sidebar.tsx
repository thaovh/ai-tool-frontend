"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Brain,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Users",
        icon: Users,
        href: "/dashboard/users",
        color: "text-violet-500",
    },
    {
        label: "Fine-tune Data",
        icon: Brain,
        href: "/dashboard/fine-tune",
        color: "text-pink-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={cn(
            "h-full bg-[#111827] text-white flex flex-col transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            <div className="px-3 py-2 flex-1">
                <div className="flex items-center justify-between pl-3 mb-14">
                    {!isCollapsed && <h1 className="text-2xl font-bold">AI Tool</h1>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-5 w-5" />
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href
                                    ? "text-white bg-white/10"
                                    : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3", route.color)} />
                                {!isCollapsed && route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <button
                    onClick={logout}
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                >
                    <div className="flex items-center flex-1">
                        <LogOut className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                        {!isCollapsed && "Logout"}
                    </div>
                </button>
            </div>
        </div>
    );
} 