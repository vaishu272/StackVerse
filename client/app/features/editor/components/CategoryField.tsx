"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Tag } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

const CATEGORIES = [
  "Next.js",
  "Prisma",
  "TypeScript",
  "System Design",
  "Cloud",
  "DevOps",
  "Security",
  "Backend",
  "Databases",
  "Go"
];

export default function CategoryField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" /> Category
          </FormLabel>
          <FormControl>
            <select
              className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 text-sm font-semibold transition-all focus:outline-none cursor-pointer"
              {...field}
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {cat}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
