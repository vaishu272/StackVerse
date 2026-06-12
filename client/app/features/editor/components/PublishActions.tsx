"use client";

import React from "react";
import Link from "next/link";
import { Save, Globe, Trash2, Loader2 } from "lucide-react";

interface PublishActionsProps {
  submitting: boolean;
  isEdit: boolean;
  onSave: (status: "DRAFT" | "PUBLISHED") => void;
  onDiscard?: () => void;
}

export default function PublishActions({
  submitting,
  isEdit,
  onSave,
  onDiscard,
}: PublishActionsProps) {
  return (
    <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Left button: Discard in Create, Cancel in Edit */}
      {isEdit ? (
        <Link
          href="/dashboard/creator"
          className="px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          Cancel
        </Link>
      ) : (
        <button
          type="button"
          onClick={onDiscard}
          disabled={submitting}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" /> Discard Draft
        </button>
      )}

      {/* Right buttons: Keep as Draft & Save/Publish */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Save as Draft */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => onSave("DRAFT")}
          className="px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEdit ? "Keep as Draft" : "Save as Draft"}
        </button>

        {/* Publish / Save & Publish */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => onSave("PUBLISHED")}
          className="px-5 py-3.5 rounded-xl bg-linear-to-r from-indigo-500 to-pink-500 hover:from-indigo-650 hover:to-pink-650 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-500/10 hover:scale-[1.01] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
          ) : (
            <Globe className="w-4.5 h-4.5" />
          )}
          {isEdit ? "Save & Publish" : "Publish Article"}
        </button>
      </div>
    </div>
  );
}
