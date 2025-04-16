"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ResponseField {
    time: string;
    action: string;
    quantity: number;
}

interface FineTuneResponseFormProps {
    value: string;
    onChange: (value: string) => void;
}

export function FineTuneResponseForm({ value, onChange }: FineTuneResponseFormProps) {
    const [fields, setFields] = useState<ResponseField[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    // Parse initial value safely
    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed[0]?.SUDUNGTHUOC) {
                    setFields(parsed[0].SUDUNGTHUOC);
                } else if (Array.isArray(parsed)) {
                    setFields(parsed);
                } else {
                    setFields([]);
                }
            } else {
                setFields([]);
            }
        } catch (error) {
            console.error("Error parsing response value:", error);
            setFields([]);
        }
    }, [value]);

    const updateParent = (newFields: ResponseField[]) => {
        const jsonData = JSON.stringify([{ SUDUNGTHUOC: newFields }]);
        onChange(jsonData);
    };

    const addField = () => {
        const newFields = [...fields, { time: "", action: "", quantity: 1.0 }];
        setFields(newFields);
        updateParent(newFields);
    };

    const removeField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
        updateParent(newFields);
    };

    const updateField = (index: number, field: Partial<ResponseField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...field };
        setFields(newFields);
        updateParent(newFields);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Response Fields</h3>
                <div className="flex items-center space-x-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="h-8 px-2"
                    >
                        {showPreview ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {showPreview ? "Hide JSON" : "Show JSON"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addField} className="h-8">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {showPreview && (
                <div className="p-2 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto max-h-[100px] p-2 bg-background rounded border">
                        {JSON.stringify([{ SUDUNGTHUOC: fields }], null, 2)}
                    </pre>
                </div>
            )}

            {fields.length === 0 ? (
                <div className="text-center p-3 border border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground">No fields added yet. Click "Add" to start.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="w-[30%]">
                                <label className="text-xs text-muted-foreground">Time</label>
                                <Input
                                    type="time"
                                    value={field.time}
                                    onChange={(e) => updateField(index, { time: e.target.value })}
                                    className="h-8"
                                />
                            </div>

                            <div className="w-[40%]">
                                <label className="text-xs text-muted-foreground">Action</label>
                                <Input
                                    value={field.action}
                                    onChange={(e) => updateField(index, { action: e.target.value })}
                                    placeholder="Enter action..."
                                    className="h-8"
                                />
                            </div>

                            <div className="w-[20%]">
                                <label className="text-xs text-muted-foreground">Quantity</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={field.quantity}
                                    onChange={(e) => updateField(index, { quantity: parseFloat(e.target.value) })}
                                    className="h-8"
                                />
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 mt-5"
                                onClick={() => removeField(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 