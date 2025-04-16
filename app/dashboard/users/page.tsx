"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";

export default function UsersPage() {
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState<any>(null);
    const { data: usersResponse, refetch, error, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            console.log('Fetching users...');
            const response = await usersAPI.getAll();
            console.log('Users API Response:', response);
            return response;
        },
    });

    // Log error if any
    if (error) {
        console.error('Error fetching users:', error);
    }

    // Lấy danh sách users từ response
    const users = usersResponse?.data?.data || [];
    console.log('Processed users:', users);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading users. Please try again later.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    {user.firstName} {user.lastName}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.status}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditUser(user)}
                                    >
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <CreateUserDialog open={open} onOpenChange={setOpen} onSuccess={refetch} />
            {editUser && (
                <EditUserDialog
                    open={!!editUser}
                    onOpenChange={(open) => !open && setEditUser(null)}
                    onSuccess={refetch}
                    data={editUser}
                />
            )}
        </div>
    );
} 