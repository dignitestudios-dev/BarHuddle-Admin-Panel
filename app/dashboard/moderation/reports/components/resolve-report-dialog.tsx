"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ResolveReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    action: "accept" | "reject";
    status: "resolve";
    banUser?: boolean;
    reason: string;
  }) => void;
  reportId: string;
  reportedName: string;
  actionType: "accept" | "reject" | null;
}

export function ResolveReportDialog({
  open,
  onOpenChange,
  onConfirm,
  reportId,
  reportedName,
  actionType,
}: ResolveReportDialogProps) {
  const [reason, setReason] = useState("");
  const [banUser, setBanUser] = useState(false);

  // Reset states when dialog opens / action changes
  useEffect(() => {
    if (open) {
      setReason(
        actionType === "accept"
          ? "Report validated and action taken"
          : "No violation found"
      );
      setBanUser(false);
    }
  }, [open, actionType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionType) return;

    const payload: any = {
      action: actionType,
      status: "resolve",
      reason: reason.trim(),
    };

    if (actionType === "accept") {
      payload.banUser = banUser;
    }

    onConfirm(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {actionType === "accept" ? (
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle2 className="size-5" />
                Accept & Resolve Report
              </span>
            ) : (
              <span className="text-red-600 flex items-center gap-2">
                <XCircle className="size-5" />
                Reject & Close Report
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {actionType === "accept" ? (
              <>
                Confirm that this report is valid. You can choose to ban/deactivate{" "}
                <strong>{reportedName}</strong> as part of the resolution.
              </>
            ) : (
              <>
                Confirm that no violation was found. This report will be dismissed and marked as resolved.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Ban User toggle (Accept action only) */}
          {actionType === "accept" && (
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="ban-switch" className="text-sm font-semibold">
                  Ban/Deactivate Reported User
                </Label>
                <p className="text-xs text-muted-foreground">
                  Completely suspend this user from BarHuddle
                </p>
              </div>
              <Switch
                id="ban-switch"
                checked={banUser}
                onCheckedChange={setBanUser}
              />
            </div>
          )}

          {/* Action Reason */}
          <div className="space-y-2">
            <Label htmlFor="resolution-reason" className="text-sm font-semibold">
              Resolution Reason / Notes
            </Label>
            <Textarea
              id="resolution-reason"
              placeholder="Provide context on why you are taking this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter className="mt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={actionType === "accept" ? "default" : "destructive"}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
