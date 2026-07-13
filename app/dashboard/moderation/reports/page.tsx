"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  User2,
  RefreshCcw,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  getReportsApi,
  updateReportApi,
  getReportByIdApi,
  type AdminReport,
} from "@/lib/api/auth.api";
import { ResolveReportDialog } from "./components/resolve-report-dialog";
import { ViewReportDialog } from "./components/view-report-dialog";

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [reportToResolve, setReportToResolve] = useState<AdminReport | null>(null);
  const [resolveActionType, setResolveActionType] = useState<"accept" | "reject" | null>(null);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset pagination to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, typeFilter]);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Map statusFilter to backend status & action query parameters
      const statusParam = statusFilter === "pending" ? "pending" : statusFilter === "resolved" ? "resolve" : "";
      const actionParam = statusFilter === "pending" ? "pending" : "";
      const typeParam = typeFilter === "all" ? "" : typeFilter;

      const response = await getReportsApi(
        currentPage,
        pageSize,
        debouncedSearchQuery,
        statusParam,
        actionParam,
        typeParam
      );
      if (response?.success) {
        setReports(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || 0);
        }
      } else {
        setError(response?.message || "Failed to load reports.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Failed to load moderation reports from the server. Ensure you have admin access."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Derived Statistics from loaded reports
  const statistics = useMemo(() => {
    const stats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      total: totalItems,
    };
    reports.forEach((r) => {
      if (r.status?.toLowerCase() === "pending") {
        stats.pending++;
      } else if (r.action?.toLowerCase() === "accept") {
        stats.accepted++;
      } else if (r.action?.toLowerCase() === "reject") {
        stats.rejected++;
      }
    });
    return stats;
  }, [reports, totalItems]);

  const statCards = [
    { label: "Pending Review", value: statistics.pending, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Accepted Violations", value: statistics.accepted, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
    { label: "Dismissed Reports", value: statistics.rejected, icon: XCircle, color: "text-red-600 bg-red-50" },
    { label: "Total Reports", value: statistics.total, icon: Flag, color: "text-blue-600 bg-blue-50" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolve":
      case "resolved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getActionStyle = (action: string) => {
    switch (action?.toLowerCase()) {
      case "accept":
        return "text-green-600 bg-green-50 border-green-200";
      case "reject":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

  // Backend is doing all searching and filtering, so we display the reports directly
  const displayedReports = reports;

  const handleOpenView = async (report: AdminReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);

    // Fetch full report details to verify latest state
    try {
      const res = await getReportByIdApi(report._id);
      if (res?.success && res.data) {
        setSelectedReport(res.data);
      }
    } catch (err) {
      console.error("Failed to load details for report", report._id);
    }
  };

  const handleOpenResolve = (report: AdminReport, action: "accept" | "reject") => {
    setReportToResolve(report);
    setResolveActionType(action);
    setResolveDialogOpen(true);
  };

  const handleConfirmResolve = async (payload: any) => {
    if (!reportToResolve) return;
    const reportId = reportToResolve._id;

    try {
      const res = await updateReportApi(reportId, payload);
      if (res?.success) {
        // Update local list state
        setReports((prev) =>
          prev.map((r) =>
            r._id === reportId
              ? {
                ...r,
                status: "resolve",
                action: payload.action,
                updatedAt: new Date().toISOString(),
              }
              : r
          )
        );
      }
    } catch (err) {
      alert("Failed to submit report resolution. Please check backend compatibility.");
    } finally {
      setResolveDialogOpen(false);
      setReportToResolve(null);
      setResolveActionType(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and moderate user-submitted reports and flags
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="border hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center  gap-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search with reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[400px]"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">User Reports</SelectItem>
            <SelectItem value="venue">Venue Reports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground text-sm">
        {displayedReports.length} report{displayedReports.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Reason / Complaint</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading report entries...
                  </div>
                </TableCell>
              </TableRow>
            ) : displayedReports.length ? (
              displayedReports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell className="font-semibold text-foreground">
                    {report.reported?.name || "Unnamed Target"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {report.type === "venue" ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-orange-600" />
                          Venue
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User2 className="size-3 text-blue-600" />
                          User
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-medium">
                    {report.reportedBy?.name || report.reportedBy?.email || "Anonymous"}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm text-muted-foreground truncate" title={report.reason}>
                      {report.reason}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusStyle(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenView(report)}
                        className="h-8 w-8 cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="size-4" />
                      </Button>

                      {report.status?.toLowerCase() === "pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer">
                              Resolve
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600 focus:text-green-600 font-medium"
                              onClick={() => handleOpenResolve(report, "accept")}
                            >
                              <CheckCircle2 className="mr-2 size-4" />
                              Accept Report
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600 font-medium"
                              onClick={() => handleOpenResolve(report, "reject")}
                            >
                              <XCircle className="mr-2 size-4" />
                              Reject Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No moderation reports matched your current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || loading}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <ViewReportDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        report={selectedReport}
      />

      {/* Resolve Dialog */}
      <ResolveReportDialog
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
        onConfirm={handleConfirmResolve}
        reportId={reportToResolve?._id || ""}
        reportedName={reportToResolve?.reported?.name || "this item"}
        actionType={resolveActionType}
      />
    </div>
  );
}
