"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS, getModelLabel } from "@/constants/models";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function ModelSelector({
  value,
  onValueChange,
  disabled = false,
  showLabel = true,
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      {showLabel && <Label htmlFor="model-select">AI Model</Label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Select a model">
            {getModelLabel(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{model.label}</span>
                {model.description && (
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
