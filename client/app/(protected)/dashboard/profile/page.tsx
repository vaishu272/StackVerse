"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";
import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";
import { authService } from "@/features/auth/services/authService";
import { blogService } from "@/features/blog/services/blogService";
import { toast } from "react-hot-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Calendar,
  Save,
  Loader2,
  BookOpen,
  PenTool,
  Camera,
} from "lucide-react";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long (max 100 characters)"),
  role: z.enum(["VISITOR", "CREATOR"]),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .or(z.literal(""))
    .optional(),
  avatar: z.string().optional().nullable().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form controls
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      role: (user?.role as "VISITOR" | "CREATOR") || "VISITOR",
      password: "",
      avatar: user?.avatar || "",
    },
    mode: "onChange",
  });

  const avatarValue = useWatch({ control: form.control, name: "avatar" });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (under 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar size must be less than 2MB");
      return;
    }

    // Validate image format
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    setUploading(true);
    const uploadToastId = toast.loading("Uploading avatar...");

    try {
      const url = await blogService.uploadImage(file);
      form.setValue("avatar", url, { shouldDirty: true });
      toast.success("Avatar uploaded successfully!", { id: uploadToastId });
    } catch (error: unknown) {
      console.error(error);
      toast.error("Failed to upload avatar. Please try again.", {
        id: uploadToastId,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    const updateToastId = toast.loading("Updating your profile settings...");

    try {
      const payload: {
        name: string;
        role: string;
        password?: string;
        avatar?: string | null;
      } = {
        name: values.name,
        role: values.role,
        avatar: values.avatar || "",
      };

      if (values.password && values.password.trim() !== "") {
        payload.password = values.password;
      }

      const response = await authService.updateProfile(payload);

      if (response.success && response.user) {
        setUser(response.user);
        toast.success("Profile updated successfully!", { id: updateToastId });
        form.reset({
          name: response.user.name,
          role: response.user.role as "VISITOR" | "CREATOR",
          password: "",
          avatar: response.user.avatar || "",
        });

        // Redirect dashboard based on selected role
        router.push("/dashboard/profile");
      }
    } catch (error: unknown) {
      console.error(error);
      const errorWithResponse = error as {
        response?: { data?: { message?: string } };
      };
      const serverMsg =
        errorWithResponse?.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(serverMsg, { id: updateToastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-3xl mx-auto space-y-6 pb-20 animate-fade-in"
      >
        {/* Top Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-650 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Configure your technical persona, account settings, and secure
            credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Avatar & Read-only summary metadata */}
          <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="text-center space-y-4 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              {/* Avatar upload wrapper */}
              <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-md shadow-indigo-500/5">
                {avatarValue ? (
                  <Image
                    src={optimizeCloudinaryUrl(avatarValue, 128)}
                    alt={user?.name || "Avatar"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white uppercase">
                    {user?.name.charAt(0) || "U"}
                  </div>
                )}

                {/* Uploading Overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>UPLOADING</span>
                  </div>
                )}

                {/* Hover Trigger Overlay */}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity duration-200 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-indigo-300" />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      {avatarValue ? "Change" : "Upload"}
                    </span>
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name}
                </h3>
                <span className="inline-block bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-indigo-500/20 mt-1">
                  Persona: {user?.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Joined{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Edit Form */}
          <div className="md:col-span-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Display Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" /> Full
                    Name
                  </FormLabel>
                  <FormControl>
                    <input
                      type="text"
                      placeholder="e.g. Richard Hendricks"
                      className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-semibold transition-all focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Address Read-only */}
            <div className="space-y-1.5">
              <label className="block text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 px-0.5 items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 inline mr-1" />{" "}
                Email Address
              </label>
              <div className="w-full bg-slate-100/30 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-900 rounded-xl px-4 py-2.5 text-slate-400 dark:text-slate-500 text-sm font-semibold select-none flex items-center justify-between">
                <span>{user?.email}</span>
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-600">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Account Role Card Selector */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" /> Developer
                    Persona
                  </FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Visitor Card */}
                    <div
                      onClick={() =>
                        user?.role !== "CREATOR" && field.onChange("VISITOR")
                      }
                      className={`border-2 rounded-2xl p-4 transition-all flex flex-col justify-between h-32 relative ${
                        user?.role === "CREATOR"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-indigo-500 dark:hover:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/10"
                      } ${
                        field.value === "VISITOR"
                          ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[1.01]"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        {field.value === "VISITOR" && (
                          <span className="h-4 w-4 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Visitor Persona
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">
                          Read guides, bookmark resources, download PDF
                          architectures.
                        </p>
                      </div>
                    </div>

                    {/* Creator Card */}
                    <div
                      onClick={() =>
                        user?.role !== "CREATOR" && field.onChange("CREATOR")
                      }
                      className={`border-2 rounded-2xl p-4 transition-all flex flex-col justify-between h-32 relative ${
                        user?.role === "CREATOR"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:border-indigo-500 dark:hover:border-slate-700/80 bg-slate-50/30 dark:bg-slate-900/10"
                      } ${
                        field.value === "CREATOR"
                          ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 scale-[1.01]"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                          <PenTool className="w-4 h-4" />
                        </div>
                        {field.value === "CREATOR" && (
                          <span className="h-4 w-4 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Creator Persona
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">
                          Author write-ups, publish engineering guides, manage
                          drafting flows.
                        </p>
                      </div>
                    </div>
                  </div>
                  {user?.role === "CREATOR" && (
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 font-semibold mt-1 px-1">
                      Note: Your role is locked as a Creator. Creators cannot
                      revert back to Visitor status.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Set/Update Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" /> New Password
                  </FormLabel>
                  <FormControl>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-semibold transition-all focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-pink-500 hover:from-indigo-650 hover:to-pink-650 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-500/10 hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
