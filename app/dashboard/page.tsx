"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, fineTuneAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useState, useEffect } from "react";

export default function DashboardPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "ADMIN";

    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);

    const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            if (!isAdmin) {
                console.log('Not admin, skipping users fetch');
                return { data: { data: [] } };
            }
            console.log('Fetching users...');
            const response = await usersAPI.getAll();
            console.log('Users response:', response);
            return response;
        },
        enabled: isAdmin,
    });

    const { data: fineTuneData, isLoading: isFineTuneLoading } = useQuery({
        queryKey: ['fine-tunes'],
        queryFn: async () => {
            try {
                console.log('Fetching fine-tune data...');
                const response = await fineTuneAPI.getAll();
                console.log('Fine-tune data response:', response);
                return response;
            } catch (error: any) {
                console.error('Error fetching fine-tune data:', error);
                // Return empty data structure instead of throwing
                return { data: { data: [], total: 0 } };
            }
        },
        retry: 1, // Only retry once
        retryDelay: 1000, // Wait 1 second before retrying
    });

    useEffect(() => {
        console.log('Users data:', usersData);
        if (usersError) {
            console.error('Users fetch error:', usersError);
        }
    }, [usersData, usersError]);

    useEffect(() => {
        console.log('Fine-tune data response:', fineTuneData);
        console.log('Fine-tune total:', fineTuneData?.data?.total);
    }, [fineTuneData]);

    if (usersLoading || isFineTuneLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const users = usersData?.data?.data || [];
    console.log('Processed users:', users);
    console.log('Users length:', users.length);
    console.log('Active users:', users.filter((user: any) => user.status === "ACTIVE").length);
    console.log('Admin users:', users.filter((user: any) => user.role === "ADMIN").length);

    const totalFineTunes = fineTuneData?.data?.total || 0;

    return (
        <div className="flex-1 space-y-6 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isAdmin && (
                    <>
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{users.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {users.filter((user: any) => user.status === "ACTIVE").length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {users.filter((user: any) => user.role === "ADMIN").length}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Fine-tune Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalFineTunes}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 