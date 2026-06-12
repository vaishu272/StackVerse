"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
      Loading rich text editor...
    </div>
  ),
});

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";

export default function EditorField() {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="htmlContent"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Article Content
          </FormLabel>
          <FormControl>
            <RichTextEditor
              value={field.value || ""}
              onChange={(val) => field.onChange(val)}
            />
          </FormControl>
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-0.5">
            Write beautiful markdown headings, bullet points, and clean syntax-highlighted code blocks
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
