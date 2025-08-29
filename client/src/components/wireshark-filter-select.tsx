"use client";

import filters from "../../../data/wireshark-filters.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface WiresharkFilter {
  name: string;
  expression: string;
  description: string;
}

interface Props {
  onSelect: (expression: string) => void;
}

export default function WiresharkFilterSelect({ onSelect }: Props) {
  return (
    <TooltipProvider>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Example filters" />
        </SelectTrigger>
        <SelectContent>
          {(filters as WiresharkFilter[]).map((f) => (
            <Tooltip key={f.expression}>
              <TooltipTrigger asChild>
                <SelectItem value={f.expression}>{f.name}</SelectItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>{f.description}</p>
                <code className="text-xs">{f.expression}</code>
              </TooltipContent>
            </Tooltip>
          ))}
        </SelectContent>
      </Select>
    </TooltipProvider>
  );
}
