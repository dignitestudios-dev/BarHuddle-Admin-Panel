"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  userName: string;
}

export function BanUserDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: BanUserDialogProps) {
  const [reason, setReason] = useState("Violation of community guidelines");

  const quickReasons = [
    "Violation of community guidelines",
    "Spam content & activity detected",
    "Harassment or abusive behavior",
    "Fake account profile detection",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim() || "Deactivated by Administrator");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="size-5" />
            Deactivate Account
          </DialogTitle>
          <DialogDescription>
            You are about to deactivate/ban the account of{" "}
            <strong className="text-foreground">{userName}</strong>. The user
            will lose access to all BarHuddle services.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Deactivation Reason</label>
            <Textarea
              placeholder="Provide a detailed explanation for deactivation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Quick select templates */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-semibold uppercase">
              Quick Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    reason === r
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground border-muted-foreground/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Deactivate User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
