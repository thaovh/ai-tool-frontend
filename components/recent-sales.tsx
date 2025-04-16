"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentSalesProps {
    data: any[];
}

export function RecentSales({ data }: RecentSalesProps) {
    if (data.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No recent users found.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {data.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>
                            {user.firstName?.[0] || ''}
                            {user.lastName?.[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        {user.role}
                    </div>
                </div>
            ))}
        </div>
    );
} 