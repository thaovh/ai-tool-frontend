"use client";

import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { EditFineTuneDialog } from "@/components/edit-fine-tune-dialog";
import { CreateFineTuneDialog } from "@/components/create-fine-tune-dialog";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fineTuneAPI } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/lib/store";
import Cookies from 'js-cookie';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FineTunePage() {
    const [editData, setEditData] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const limit = 10;
    const user = useAuthStore((state) => state.user);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        console.log('Current token:', token);
        console.log('Current user:', user);
    }, [user]);

    const { data: fineTuneResponse, refetch, isLoading, error } = useQuery({
        queryKey: ["fine-tune", page, debouncedSearch],
        queryFn: async () => {
            console.log('Fetching fine-tune data with params:', { page, limit, search: debouncedSearch });
            try {
                let response;
                if (debouncedSearch) {
                    response = await fineTuneAPI.search(debouncedSearch, { page, limit });
                } else {
                    response = await fineTuneAPI.getAll({ page, limit });
                }
                console.log('Fine-tune API response:', response);
                return response;
            } catch (error) {
                console.error('Fine-tune API error:', error);
                throw error;
            }
        },
    });

    const handlePreviousPage = () => {
        setPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prev) => prev + 1);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await fineTuneAPI.delete(deleteId);
            toast.success("Fine-tune data deleted successfully");
            setDeleteId(null);
            refetch();
        } catch (error) {
            console.error("Error deleting fine-tune data:", error);
            toast.error("Failed to delete fine-tune data");
        }
    };

    // Lấy danh sách fine-tune data và thông tin phân trang từ response
    const fineTuneData = fineTuneResponse?.data?.data || [];
    const total = fineTuneResponse?.data?.total || 0;
    const totalPages = fineTuneResponse?.data?.totalPages || Math.ceil(total / limit);

    useEffect(() => {
        if (error) {
            console.error("Error fetching fine-tune data:", error);
            toast.error("Failed to fetch fine-tune data");
        }
    }, [error]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Fine-tune Data</h2>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[200px]"
                    />
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Data
                    </Button>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Prompt</TableHead>
                            <TableHead>Response</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Checked</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fineTuneData.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell className="max-w-[200px] truncate">
                                    {item.prompt}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {item.response}
                                </TableCell>
                                <TableCell>{item.createdBy?.email || 'N/A'}</TableCell>
                                <TableCell>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {item.isChecked ? (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Checked
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            Unchecked
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditData(item)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeleteId(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {fineTuneData.length} of {total} items
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {editData && (
                <EditFineTuneDialog
                    data={editData}
                    open={!!editData}
                    onOpenChange={(open) => !open && setEditData(null)}
                    onSuccess={() => {
                        setEditData(null);
                        refetch();
                    }}
                />
            )}
            {deleteId && (
                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                fine-tune data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <CreateFineTuneDialog open={open} onOpenChange={setOpen} onSuccess={refetch} />
        </div>
    );
} 