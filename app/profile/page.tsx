'use client';

import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
    const { user } = useAuthStore();

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/avatars/01.png" alt={user?.firstName || ""} />
                            <AvatarFallback>
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">
                                {user?.firstName} {user?.lastName}
                            </CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium">Role</h3>
                                <p className="text-sm text-muted-foreground">{user?.role}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Status</h3>
                                <p className="text-sm text-muted-foreground">{user?.status}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium">Phone Number</h3>
                            <p className="text-sm text-muted-foreground">{user?.phoneNumber}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 