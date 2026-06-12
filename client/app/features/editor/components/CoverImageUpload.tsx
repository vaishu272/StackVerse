"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, Upload, Loader2, X, AlertCircle } from "lucide-react";
import { blogService } from "@/features/blog/services/blogService";
import { toast } from "react-hot-toast";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { cn } from "@/shared/utils/cn";
import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";

export default function CoverImageUpload() {
  const { control, setValue, watch } = useFormContext();
  const coverImageUrl = watch("coverImage") || "";

  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // Basic validations
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setUploading(true);
    const uploadToastId = toast.loading("Uploading cover image to Cloudinary...");

    try {
      const url = await blogService.uploadImage(file);
      setValue("coverImage", url, { shouldValidate: true, shouldDirty: true });
      toast.success("Cover image uploaded successfully!", { id: uploadToastId });
    } catch (error: unknown) {
      console.error(error);
      const errorWithResponse = error as { response?: { data?: { message?: string } } };
      const errorMsg = errorWithResponse?.response?.data?.message || "Failed to upload image. Please try again.";
      toast.error(errorMsg, { id: uploadToastId });
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const removeCoverImage = () => {
    setValue("coverImage", "", { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {/* Form control wrapper for validation */}
      <FormField
        control={control}
        name="coverImage"
        render={({ fieldState: { error } }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> Cover Image
            </FormLabel>
            
            {/* Upload Zone */}
            <FormControl>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={coverImageUrl ? undefined : triggerFileSelect}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-48 relative overflow-hidden",
                  isDragActive
                    ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[1.01]"
                    : coverImageUrl
                    ? "border-slate-200 dark:border-slate-800 p-0"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/10",
                  error && "border-rose-500 bg-rose-500/5 dark:bg-rose-500/5"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-9 h-9 animate-spin text-indigo-500" />
                    <p className="text-xs font-semibold">Streaming to Cloudinary...</p>
                  </div>
                ) : coverImageUrl ? (
                  <div className="w-full h-48 relative group animate-fade-in">
                    <Image
                      src={optimizeCloudinaryUrl(coverImageUrl, 800)}
                      alt="Cover image preview"
                      width={800}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-101 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCoverImage();
                        }}
                        className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                      >
                        <X className="w-4 h-4" /> Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 flex flex-col items-center">
                    <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Drag and drop your cover file, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                        PNG, JPG or WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            
            {/* Input URL Box fallback */}
            <div className="space-y-1 mt-2">
              <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-500 px-0.5">
                Or paste a direct image URL manually below:
              </span>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImageUrl}
                onChange={(e) => setValue("coverImage", e.target.value, { shouldValidate: true, shouldDirty: true })}
                className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-600 text-xs font-semibold transition-all focus:outline-none"
              />
            </div>
            
            {error && (
              <p className="text-xs font-semibold text-rose-500 px-0.5 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error.message}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
