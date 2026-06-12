"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { FileText } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

export default function ExcerptField() {
  const { control, watch } = useFormContext();
  const excerptValue = watch("excerpt") || "";

  return (
    <FormField
      control={control}
      name="excerpt"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Excerpt Summary
          </FormLabel>
          <FormControl>
            <textarea
              rows={3}
              placeholder="Provide a concise 1-2 sentence engineering overview of the write-up (will display on feeds and cards)..."
              className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm leading-relaxed transition-all focus:outline-none resize-none"
              {...field}
            />
          </FormControl>
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
            <span>Minimum 10 characters</span>
            <span className={excerptValue.length > 300 ? "text-rose-500" : ""}>
              {excerptValue.length}/300
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
