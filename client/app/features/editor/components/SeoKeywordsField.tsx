"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Globe } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

export default function SeoKeywordsField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="seoKeywords"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" /> SEO Keywords
          </FormLabel>
          <FormControl>
            <input
              type="text"
              placeholder="e.g. scaling, postgres, backend, database sharding (comma separated)"
              className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-semibold transition-all focus:outline-none"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
