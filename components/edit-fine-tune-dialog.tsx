"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { fineTuneAPI } from "@/lib/api";
import { toast } from "sonner";
import { FineTuneResponseForm } from "./fine-tune-response-form";
import { Pencil, Loader2 } from "lucide-react";
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

interface EditFineTuneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    data: {
        id: string;
        prompt: string;
        response: string;
        isChecked: boolean;
    };
}

export function EditFineTuneDialog({
    open,
    onOpenChange,
    onSuccess,
    data,
}: EditFineTuneDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: data.prompt,
            response: data.response,
            isChecked: data.isChecked,
        },
    });

    const { mutate: updateFineTune, isPending } = useMutation({
        mutationFn: (values: z.infer<typeof formSchema>) => {
            console.log('Updating fine-tune data:', { id: data.id, ...values });
            return fineTuneAPI.update(data.id, values);
        },
        onSuccess: () => {
            toast.success("Fine-tune data updated successfully");
            onOpenChange(false);
            onSuccess();
        },
        onError: (error: any) => {
            console.error('Update fine-tune error:', error);
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        updateFineTune(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Fine-tune Data</DialogTitle>
                    <DialogDescription>
                        Edit the prompt and response for this fine-tune data entry.
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
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 