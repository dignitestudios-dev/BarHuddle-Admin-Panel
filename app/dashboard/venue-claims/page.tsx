"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RefreshCcw,
  Eye,
  FileText,
  ShieldCheck,
  EllipsisVertical,
  User,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  Mail,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getVenueClaimsApi,
  updateVenueClaimStatusApi,
  type VenueClaimItem,
} from "@/lib/api/auth.api";
import { ViewClaimDialog } from "./components/view-claim-dialog";
import { ClaimActionDialog } from "./components/claim-action-dialog";
import { LightboxProofViewer } from "./components/lightbox-proof-viewer";
import { ImageWithFallback, DUMMY_IMAGE } from "@/components/ui/image-with-fallback";


export default function VenueClaimsPage() {
  const [claims, setClaims] = useState<VenueClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status Filter state (All, Pending, Approved, Revoked)
  const [statusFilter, setStatusFilter] = useState("all");

  // View Claim Detail dialog state
  const [selectedClaimForView, setSelectedClaimForView] = useState<VenueClaimItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Approve / Reject Action dialog state
  const [selectedClaimForAction, setSelectedClaimForAction] = useState<VenueClaimItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  // Fullscreen Proof Viewer dialog state
  const [fullscreenProof, setFullscreenProof] = useState<{
    url: string;
    venueName: string;
    contactName?: string;
  } | null>(null);
  const [fullscreenProofOpen, setFullscreenProofOpen] = useState(false);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Fetch claims from API
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getVenueClaimsApi(currentPage, pageSize, statusFilter);

      if (response?.success) {
        setClaims(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || 0);
        }
      } else {
        setError(response?.message || "Failed to load venue owner claims.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load venue ownership claims. Please ensure your session is valid."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Derived metrics from loaded dataset
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let revokedCount = 0;

    claims.forEach((c) => {
      const st = c.status?.toLowerCase();
      if (st === "pending") pendingCount++;
      else if (st === "approved") approvedCount++;
      else if (st === "revoked" || st === "rejected") revokedCount++;
    });

    return {
      pending: pendingCount,
      approved: approvedCount,
      revoked: revokedCount,
      total: totalItems,
    };
  }, [claims, totalItems]);

  const statCards = [
    {
      label: "Pending Claims",
      value: metrics.pending,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
      description: "Awaiting review",
    },
    {
      label: "Approved Claims",
      value: metrics.approved,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
      description: "Verified bar owners",
    },
    {
      label: "Revoked / Rejected",
      value: metrics.revoked,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
      description: "Declined claims",
    },
    {
      label: "Total Requests",
      value: metrics.total,
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
      description: "All logged submissions",
    },
  ];

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

  const getInitials = (name: string | null | undefined, email?: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return (email || "VO").substring(0, 2).toUpperCase();
  };

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Dialog Triggers
  const handleOpenView = (claim: VenueClaimItem) => {
    setSelectedClaimForView(claim);
    setViewDialogOpen(true);
  };

  const handleOpenAction = (claim: VenueClaimItem, type: "approve" | "reject") => {
    setSelectedClaimForAction(claim);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleOpenFullscreen = (
    proofUrl: string,
    venueName: string,
    contactName?: string
  ) => {
    setFullscreenProof({
      url: proofUrl,
      venueName,
      contactName,
    });
    setFullscreenProofOpen(true);
  };

  // Confirm API update
  const handleConfirmAction = async (claimId: string, status: "approved" | "revoked") => {
    const res = await updateVenueClaimStatusApi(claimId, status);
    if (res?.success) {
      setClaims((prev) =>
        prev.map((c) =>
          c._id === claimId
            ? {
                ...c,
                status: status,
                reviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bar Owner Claims</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, verify, and approve or reject bar ownership claims submitted by venue owners.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchClaims}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClaims}
            className="ml-4 gap-1.5 text-red-700 border-red-300 hover:bg-red-100"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="border hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar (Search removed as requested) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter by Status:</span>
          <div className="w-56">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="cursor-pointer w-full h-9">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Claims</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved Claims</SelectItem>
                <SelectItem value="revoked">Revoked / Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-muted-foreground text-xs">
          Showing <strong className="text-foreground">{claims.length}</strong> of{" "}
          <strong className="text-foreground">{totalItems}</strong> claims
        </p>
      </div>

      {/* Claims Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Venue Information</TableHead>
              <TableHead className="min-w-[200px]">Contact Person</TableHead>
              <TableHead className="min-w-[160px]">App Account</TableHead>
              <TableHead className="min-w-[150px]">Proof of Ownership</TableHead>
              <TableHead className="min-w-[110px]">Claimed Date</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="w-28 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading venue claims...
                  </div>
                </TableCell>
              </TableRow>
            ) : claims.length ? (
              claims.map((claim) => {
                const venue = claim.venue;
                const venueName = venue?.name || claim.venueName || "Venue Removed / Unavailable";
                const venueAddress = venue?.address || claim.venueAddress || "—";
                const placeId = venue?.placeId;
                const coverImage = venue?.coverImage;

                const contactName = claim.contactName || claim.name || "Not provided";
                const contactEmail = claim.contactEmail || claim.email || "";

                const userName = claim.user?.name || "Unlinked Account";
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

                const isImage =
                  proofUrl &&
                  (/\.(jpg|jpeg|png|webp|avif|gif|jfif)(\?.*)?$/i.test(proofUrl) ||
                    proofUrl.includes("/images/") ||
                    proofUrl.includes("/others/"));

                return (
                  <TableRow key={claim._id} className="hover:bg-muted/30 transition-colors">
                    {/* Venue Details */}
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <div className="size-9 rounded-md overflow-hidden border shrink-0 bg-muted mt-0.5">
                          <ImageWithFallback
                            src={coverImage || DUMMY_IMAGE}
                            alt={venueName}
                            fallbackSrc={DUMMY_IMAGE}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[260px]">
                          <span
                            className="font-semibold text-foreground truncate"
                            title={venueName}
                          >
                            {venueName}
                          </span>
                          <span
                            className="text-xs text-muted-foreground truncate"
                            title={venueAddress}
                          >
                            {venueAddress}
                          </span>
                          {placeId && (
                            <span className="text-[10px] text-muted-foreground font-mono truncate">
                              Place ID: {placeId}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Person */}
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground text-sm flex items-center gap-1.5 truncate">
                          <User className="size-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{contactName}</span>
                        </span>
                        {contactEmail && (
                          <a
                            href={`mailto:${contactEmail}`}
                            className="text-xs text-muted-foreground hover:text-primary truncate block mt-0.5"
                            title={contactEmail}
                          >
                            {contactEmail}
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* App Account User */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[11px] font-semibold">
                            {getInitials(userName, userEmail)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 max-w-[140px]">
                          <span className="text-xs font-medium text-foreground truncate">
                            {userName}
                          </span>
                          {userEmail && (
                            <span className="text-[11px] text-muted-foreground truncate" title={userEmail}>
                              {userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Proof of Ownership */}
                    <TableCell>
                      {proofUrl ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenFullscreen(proofUrl!, venueName, contactName)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-muted/30 hover:bg-muted text-primary cursor-pointer transition-colors"
                            title="Click to view full screen"
                          >
                            {isImage ? (
                              <ImageIcon className="size-3.5 text-blue-600 shrink-0" />
                            ) : (
                              <FileText className="size-3.5 text-purple-600 shrink-0" />
                            )}
                            <span>View Proof</span>
                            <Maximize2 className="size-3 text-muted-foreground ml-0.5 shrink-0" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No file attached
                        </span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(claim.claimedAt || claim.createdAt)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getStatusColor(claim.status)}`}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          title="View Claim Details"
                          onClick={() => handleOpenView(claim)}
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">View Details</span>
                        </Button>

                        {/* Quick Approve / Reject for Pending */}
                        {claim.status?.toLowerCase() === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                              title="Approve Claim"
                              onClick={() => handleOpenAction(claim, "approve")}
                            >
                              <CheckCircle2 className="size-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                              title="Reject Claim"
                              onClick={() => handleOpenAction(claim, "reject")}
                            >
                              <XCircle className="size-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}

                        {/* More dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <EllipsisVertical className="size-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleOpenView(claim)}
                            >
                              <Eye className="mr-2 size-4" />
                              View Full Details
                            </DropdownMenuItem>

                            {proofUrl && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleOpenFullscreen(proofUrl!, venueName, contactName)}
                              >
                                <Maximize2 className="mr-2 size-4" />
                                Full Screen Proof
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {claim.status?.toLowerCase() !== "approved" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-green-600 focus:text-green-600 font-medium"
                                onClick={() => handleOpenAction(claim, "approve")}
                              >
                                <CheckCircle2 className="mr-2 size-4" />
                                Approve Ownership
                              </DropdownMenuItem>
                            )}

                            {claim.status?.toLowerCase() !== "revoked" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-600 font-medium"
                                onClick={() => handleOpenAction(claim, "reject")}
                              >
                                <XCircle className="mr-2 size-4" />
                                {claim.status?.toLowerCase() === "approved"
                                  ? "Revoke Ownership"
                                  : "Reject Claim"}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No venue owner claims found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-18 h-8 text-xs cursor-pointer">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-muted-foreground">
            Page <strong className="text-foreground">{currentPage}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="cursor-pointer h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="cursor-pointer h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      <ViewClaimDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        claim={selectedClaimForView}
        onApprove={(c) => handleOpenAction(c, "approve")}
        onReject={(c) => handleOpenAction(c, "reject")}
      />

      {/* Approve / Reject Action Modal */}
      <ClaimActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        claim={selectedClaimForAction}
        actionType={actionType}
        onConfirm={handleConfirmAction}
      />

      {/* Library Lightbox Viewer */}
      <LightboxProofViewer
        open={fullscreenProofOpen}
        onClose={() => setFullscreenProofOpen(false)}
        imageUrl={fullscreenProof?.url || null}
        title={fullscreenProof ? `${fullscreenProof.venueName} — Ownership Proof` : undefined}
      />
    </div>
  );
}

