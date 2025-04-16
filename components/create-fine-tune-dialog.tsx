"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { fineTuneAPI } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FineTuneResponseForm } from "./fine-tune-response-form";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

type FormValues = {
    prompt: string;
    response: string;
    isChecked: boolean;
};

const formSchema = z.object({
    prompt: z.string().min(1, "Prompt is required"),
    response: z.string().min(1, "Response is required"),
    isChecked: z.boolean(),
}) satisfies z.ZodType<FormValues>;

interface CreateFineTuneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateFineTuneDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateFineTuneDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            response: "",
        },
    });

    const { mutate: createFineTune, isPending } = useMutation({
        mutationFn: (values: FormValues) => {
            console.log('Creating fine-tune data:', values);
            return fineTuneAPI.create(values);
        },
        onSuccess: () => {
            toast.success("Fine-tune data created successfully");
            form.reset();
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error: any) => {
            console.error('Create fine-tune error:', error);
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    function onSubmit(values: FormValues) {
        createFineTune(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Create Fine-tune Data</DialogTitle>
                    <DialogDescription>
                        Add a new fine-tune data entry. This will be used to train the model.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter the prompt..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="response"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Response</FormLabel>
                                    <FormControl>
                                        <FineTuneResponseForm
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isChecked"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Mark as checked
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 