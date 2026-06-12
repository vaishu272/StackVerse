"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

export default function ArticleTitleField() {
  const { control, watch } = useFormContext();
  const titleValue = watch("title") || "";

  return (
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel>Article Title</FormLabel>
          <FormControl>
            <input
              type="text"
              placeholder="e.g. Building High-Performance Multi-tenant Databases"
              className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base font-semibold transition-all focus:outline-none"
              {...field}
            />
          </FormControl>
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1">
            <span className={titleValue.length > 150 ? "text-rose-500" : ""}>
              {titleValue.length}/150
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
