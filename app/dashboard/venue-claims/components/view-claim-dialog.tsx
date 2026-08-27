"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type VenueClaimItem } from "@/lib/api/auth.api";
import {
  Building2,
  Mail,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  Maximize2,
  Image as ImageIcon,
  UserCheck,
} from "lucide-react";
import { LightboxProofViewer } from "./lightbox-proof-viewer";

interface ViewClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: VenueClaimItem | null;
  onApprove?: (claim: VenueClaimItem) => void;
  onReject?: (claim: VenueClaimItem) => void;
}

export function ViewClaimDialog({
  open,
  onOpenChange,
  claim,
  onApprove,
  onReject,
}: ViewClaimDialogProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!claim) return null;

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "text-green-700 bg-green-50 border-green-200";
      case "revoked":
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200";
      case "pending":
      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  // Resolve venue details
  const venue = claim.venue;
  const venueName = venue?.name || claim.venueName || "Venue Unavailable";
  const venueAddress = venue?.address || claim.venueAddress || "No address provided";
  const placeId = venue?.placeId;
  const coverImage = venue?.coverImage;

  // Resolve claimant & contact details
  const contactName = claim.contactName || claim.name || "Not provided";
  const contactEmail = claim.contactEmail || claim.email || "Not provided";
  const userName = claim.user?.name || "Not linked";
  const userEmail = claim.user?.email || "";

  // Resolve proof URL
  let proofUrl: string | null = null;
  if (typeof claim.ownershipProof === "string") {
    proofUrl = claim.ownershipProof;
  } else if (claim.ownershipProof?.location) {
    proofUrl = claim.ownershipProof.location;
  } else if (claim.ownershipProof?.url) {
    proofUrl = claim.ownershipProof.url;
  }

  const isImageProof =
    proofUrl &&
    (/\.(jpg|jpeg|png|webp|avif|gif|jfif)(\?.*)?$/i.test(proofUrl) ||
      proofUrl.includes("/images/") ||
      proofUrl.includes("/others/"));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="p-1">
            <div className="flex items-center justify-between mt-1 gap-2">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <span>Venue Ownership Claim</span>
              </DialogTitle>
              <Badge variant="outline" className={`capitalize shrink-0 ${getStatusColor(claim.status)}`}>
                Status: {claim.status}
              </Badge>
            </div>
            <DialogDescription>
              Claim ID: <span className="font-mono text-foreground text-xs">{claim._id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Venue Card */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Claimed Venue Details
              </span>
              <div className="flex items-start gap-3 rounded-lg border p-3.5 bg-muted/10">
                {coverImage ? (
                  <div className="size-14 rounded-md overflow-hidden border shrink-0 bg-muted">
                    <img
                      src={coverImage}
                      alt={venueName}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-md bg-orange-100 p-2.5 text-orange-700 shrink-0 mt-0.5">
                    <Building2 className="size-5" />
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-foreground text-base break-words">
                    {venueName}
                  </span>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5 min-w-0">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="break-words whitespace-normal leading-relaxed flex-1">
                      {venueAddress}
                    </span>
                  </div>
                  {placeId && (
                    <span className="text-[11px] text-muted-foreground font-mono mt-1 break-all">
                      Place ID: {placeId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & User Card */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Claimant & Contact Information
              </span>
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3.5 bg-muted/10">
                {/* Contact Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-md bg-blue-100 p-2 text-blue-700 shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      Contact Name
                    </span>
                    <span className="text-sm font-semibold text-foreground break-words block">
                      {contactName}
                    </span>
                  </div>
                </div>

                {/* Contact Email */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-md bg-purple-100 p-2 text-purple-700 shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      Contact Email
                    </span>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-sm font-semibold text-primary hover:underline break-all block"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>

                {/* App Account User */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-md bg-emerald-100 p-2 text-emerald-700 shrink-0">
                    <UserCheck className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      App Account User
                    </span>
                    <span className="text-sm font-semibold text-foreground break-words block">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground break-all block">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-md bg-gray-100 p-2 text-gray-700 shrink-0">
                    <Clock className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground block font-medium">
                      Claimed At
                    </span>
                    <span className="text-xs font-semibold text-foreground block">
                      {formatDate(claim.claimedAt || claim.createdAt)}
                    </span>
                    {claim.reviewedAt && (
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Reviewed: {formatDate(claim.reviewedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Proof of Ownership */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Proof of Ownership Document
                </span>
                {proofUrl && (
                  <div className="flex items-center gap-2">
                    {isImageProof && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary gap-1 h-7 px-2 cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      >
                        <Maximize2 className="size-3.5" /> Full Screen
                      </Button>
                    )}
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>

              {proofUrl ? (
                <div className="rounded-lg border bg-muted/5 p-3 flex flex-col items-center justify-center relative group">
                  {isImageProof ? (
                    <div
                      className="relative w-full max-h-72 rounded-md overflow-hidden border bg-background flex items-center justify-center p-1 cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                      title="Click to view in full screen"
                    >
                      <img
                        src={proofUrl}
                        alt="Proof of ownership"
                        className="max-h-64 object-contain rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium">
                        <Maximize2 className="size-4" /> Click for Full Screen
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <FileText className="size-8" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        Document Attached
                      </span>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Click below to view the submitted proof document.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="default" size="sm" className="gap-1.5 cursor-pointer">
                            <ExternalLink className="size-3.5" />
                            Open in Tab
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-1.5 bg-muted/5">
                  <ImageIcon className="size-6 opacity-40" />
                  <span>No proof of ownership file attached to this claim.</span>
                </div>
              )}
            </div>

            {/* Actions Bar inside Dialog */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                {claim.status?.toLowerCase() !== "revoked" && onReject && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer gap-1.5"
                    onClick={() => {
                      onOpenChange(false);
                      onReject(claim);
                    }}
                  >
                    <XCircle className="size-4" />
                    {claim.status?.toLowerCase() === "approved"
                      ? "Revoke Claim"
                      : "Reject Claim"}
                  </Button>
                )}

                {claim.status?.toLowerCase() !== "approved" && onApprove && (
                  <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      onOpenChange(false);
                      onApprove(claim);
                    }}
                  >
                    <CheckCircle2 className="size-4" />
                    Approve Claim
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Lightbox Viewer */}
      {isImageProof && (
        <LightboxProofViewer
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={proofUrl}
          title={`${venueName} — Ownership Proof`}
        />
      )}
    </>
  );
}
