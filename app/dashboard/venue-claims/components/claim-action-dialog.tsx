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
import { CheckCircle2, XCircle, Loader2, Building2, User, AlertTriangle } from "lucide-react";
import { type VenueClaimItem } from "@/lib/api/auth.api";

interface ClaimActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: VenueClaimItem | null;
  actionType: "approve" | "reject" | null;
  onConfirm: (claimId: string, status: "approved" | "revoked") => Promise<void>;
}

export function ClaimActionDialog({
  open,
  onOpenChange,
  claim,
  actionType,
  onConfirm,
}: ClaimActionDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!claim || !actionType) return null;

  const isApprove = actionType === "approve";

  const venueName =
    claim.venue?.name ||
    (typeof claim.venueId === "object" ? claim.venueId?.name : null) ||
    claim.venueName ||
    "this venue";

  const claimantName = claim.name || claim.email || "the applicant";

  const handleAction = async () => {
    setLoading(true);
    try {
      await onConfirm(claim._id, isApprove ? "approved" : "revoked");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update claim status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`p-2.5 rounded-full shrink-0 ${
                isApprove ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="size-6" />
              ) : (
                <AlertTriangle className="size-6" />
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg break-words">
                {isApprove ? "Approve Ownership Claim" : "Reject Ownership Claim"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isApprove
                  ? "Grant venue management privileges"
                  : "Decline and revoke ownership request"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-start gap-2 text-foreground font-semibold">
              <Building2 className="size-4 text-orange-600 shrink-0 mt-0.5" />
              <span className="break-words flex-1">{venueName}</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <User className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="break-words flex-1">
                Claimant: <strong className="text-foreground">{claimantName}</strong> (
                <span className="break-all">{claim.email}</span>)
              </span>
            </div>
          </div>

          <p className="break-words leading-relaxed">
            {isApprove ? (
              <>
                Are you sure you want to approve this claim? Approving will grant{" "}
                <strong className="text-foreground">{claimantName}</strong> full ownership
                and administrative control for{" "}
                <strong className="text-foreground">{venueName}</strong> in the Bar Portal.
              </>
            ) : (
              <>
                Are you sure you want to reject this claim? This will mark the request
                as <strong className="text-destructive font-semibold">revoked</strong>. The
                claimant will not be granted management permissions for{" "}
                <strong className="text-foreground">{venueName}</strong>.
              </>
            )}
          </p>
        </div>

        <DialogFooter className="mt-2 flex sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isApprove ? "default" : "destructive"}
            className={isApprove ? "bg-green-600 hover:bg-green-700 text-white" : ""}
            disabled={loading}
            onClick={handleAction}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {isApprove ? "Approving..." : "Rejecting..."}
              </>
            ) : isApprove ? (
              "Confirm & Approve"
            ) : (
              "Confirm & Reject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
