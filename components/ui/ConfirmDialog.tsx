// ============================================
// CONFIRM DIALOG COMPONENT - Reusable confirmation modal
// ============================================
// Beautiful alternative to browser's confirm() dialog using shadcn/ui

"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[400px]">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div
            className={`p-3 rounded-full ${
              confirmVariant === "danger"
                ? "bg-rose-100 dark:bg-rose-500/15"
                : "bg-blue-100 dark:bg-blue-500/15"
            }`}
          >
            <AlertTriangle
              className={`w-8 h-8 ${
                confirmVariant === "danger"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription className="text-sm">{message}</DialogDescription>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              variant={confirmVariant === "danger" ? "destructive" : "default"}
              className="flex-1"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
