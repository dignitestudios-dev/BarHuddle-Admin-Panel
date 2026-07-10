"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type AdminReport } from "@/lib/api/auth.api";
import {
  User2,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

interface ViewReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AdminReport | null;
}

export function ViewReportDialog({
  open,
  onOpenChange,
  report,
}: ViewReportDialogProps) {
  if (!report) return null;

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolve":
      case "resolved":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending":
        return "text-orange-700 bg-orange-50 border-orange-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case "accept":
        return "text-green-700 bg-green-50 border-green-200";
      case "reject":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-orange-700 bg-orange-50 border-orange-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between mt-1">
            <DialogTitle className="flex items-center gap-2">
              <Flag className="size-5 text-primary" />
              Report Details
            </DialogTitle>
            <Badge variant="outline" className={getStatusColor(report.status)}>
              Status: {report.status}
            </Badge>
          </div>
          <DialogDescription>
            Report filed on {formatDate(report.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Reporter details */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reported By
            </span>
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/10">
              {report.reportedBy ? (
                <>
                  <Avatar className="h-8 w-8">
                    {report.reportedBy.profilePicture?.location && (
                      <AvatarImage
                        src={report.reportedBy.profilePicture.location}
                        alt={report.reportedBy.name || report.reportedBy.email}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-xs font-semibold">
                      {getInitials(report.reportedBy.name, report.reportedBy.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {report.reportedBy.name || "No Name"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.reportedBy.email}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">Anonymous User</span>
              )}
            </div>
          </div>

          {/* Reported target details */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reported Content / Target
            </span>
            <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/10">
              {report.reported ? (
                <>
                  {report.type === "venue" ? (
                    <MapPin className="size-8 text-orange-600 shrink-0" />
                  ) : (
                    <User2 className="size-8 text-blue-600 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {report.reported.name || "Unnamed Target"}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      Type: {report.type} ({report.targetModel})
                    </span>
                    {report.reported.email && (
                      <span className="text-xs text-muted-foreground">
                        {report.reported.email}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-sm text-muted-foreground italic">Target unavailable / deleted</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Reason / Details */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reason / Complaint
            </span>
            <p className="text-sm border rounded-lg p-3 bg-muted/5 font-medium">
              {report.reason || "No description provided."}
            </p>
          </div>

          {/* Resolution Status if resolved */}
          {report.status?.toLowerCase() === "resolve" && (
            <div className="space-y-2 border-t pt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Resolution Details
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Action Taken</span>
                  <Badge variant="outline" className={`mt-1 ${getActionColor(report.action)}`}>
                    {report.action}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block font-medium">Updated At</span>
                  <span className="text-xs font-semibold text-foreground">
                    {formatDate(report.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
