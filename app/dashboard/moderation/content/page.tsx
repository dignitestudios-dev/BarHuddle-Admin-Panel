"use client";

import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Flag,
  FileText,
  Image,
  Video,
  MessageSquare,
  Clock,
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

type ContentStatus = "Pending" | "Approved" | "Rejected" | "Flagged";
type ContentType = "Post" | "Image" | "Video" | "Comment";

interface ContentItem {
  id: number;
  title: string;
  author: string;
  type: ContentType;
  status: ContentStatus;
  submittedDate: string;
  flagReason?: string;
}

const initialContent: ContentItem[] = [
  { id: 1, title: "Top 10 Investment Tips You Must Know", author: "Michael Chen", type: "Post", status: "Pending", submittedDate: "2024-08-13", flagReason: "Possible financial misinformation" },
  { id: 2, title: "Community Event Photo Album", author: "Sarah Johnson", type: "Image", status: "Approved", submittedDate: "2024-08-12" },
  { id: 3, title: "Weekly Workout Tutorial", author: "David Thompson", type: "Video", status: "Pending", submittedDate: "2024-08-13" },
  { id: 4, title: "Why the election is rigged...", author: "Kevin Taylor", type: "Post", status: "Flagged", submittedDate: "2024-08-11", flagReason: "Potential misinformation / political" },
  { id: 5, title: "Check out my new product!", author: "Jessica Parker", type: "Comment", status: "Rejected", submittedDate: "2024-08-10", flagReason: "Spam / unsolicited advertising" },
  { id: 6, title: "Beginner's Guide to Meditation", author: "Emily Rodriguez", type: "Post", status: "Approved", submittedDate: "2024-08-09" },
  { id: 7, title: "Stream highlights reel", author: "Amanda Foster", type: "Video", status: "Flagged", submittedDate: "2024-08-12", flagReason: "Possible copyright violation" },
  { id: 8, title: "This supplement CURES everything!", author: "Ashley White", type: "Post", status: "Pending", submittedDate: "2024-08-13", flagReason: "Health misinformation alert" },
  { id: 9, title: "Product review: honest thoughts", author: "Daniel Kim", type: "Comment", status: "Approved", submittedDate: "2024-08-11" },
  { id: 10, title: "Off-topic rant in wrong category", author: "Lisa Martinez", type: "Comment", status: "Rejected", submittedDate: "2024-08-10" },
  { id: 11, title: "New photography portfolio", author: "James Anderson", type: "Image", status: "Pending", submittedDate: "2024-08-13" },
  { id: 12, title: "Breaking: unverified news story", author: "Robert Wilson", type: "Post", status: "Flagged", submittedDate: "2024-08-12", flagReason: "Unverified / potentially false news" },
];

const statCards = [
  { label: "Pending Review", value: 4, icon: Clock, color: "text-orange-600 bg-orange-50" },
  { label: "Approved", value: 4, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  { label: "Rejected", value: 2, icon: XCircle, color: "text-red-600 bg-red-50" },
  { label: "Flagged", value: 3, icon: Flag, color: "text-purple-600 bg-purple-50" },
];

const getStatusStyle = (status: ContentStatus) => {
  switch (status) {
    case "Pending": return "text-orange-600 bg-orange-50 border-orange-200";
    case "Approved": return "text-green-600 bg-green-50 border-green-200";
    case "Rejected": return "text-red-600 bg-red-50 border-red-200";
    case "Flagged": return "text-purple-600 bg-purple-50 border-purple-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getTypeIcon = (type: ContentType) => {
  switch (type) {
    case "Post": return FileText;
    case "Image": return Image;
    case "Video": return Video;
    case "Comment": return MessageSquare;
    default: return FileText;
  }
};

export default function ContentModerationPage() {
  const [items, setItems] = useState<ContentItem[]>(initialContent);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchType = typeFilter === "all" || item.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [items, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const updateStatus = (id: number, status: ContentStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review, approve, reject, or flag submitted content
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-muted-foreground text-sm">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search content or author..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Post">Post</SelectItem>
            <SelectItem value="Image">Image</SelectItem>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Comment">Comment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-muted-foreground text-sm">
        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Flag Reason</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? (
              paginated.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[180px]">
                      <p className="truncate">{item.title}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.author}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="size-3.5 text-muted-foreground" />
                        <span className="text-sm">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      {item.flagReason ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.flagReason}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.submittedDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusStyle(item.status)}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer h-7 text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                          onClick={() => updateStatus(item.id, "Approved")}
                          disabled={item.status === "Approved"}
                        >
                          <CheckCircle2 className="size-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer h-7 text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                          onClick={() => updateStatus(item.id, "Rejected")}
                          disabled={item.status === "Rejected"}
                        >
                          <XCircle className="size-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
                          onClick={() => updateStatus(item.id, "Flagged")}
                          disabled={item.status === "Flagged"}
                        >
                          <Flag className="size-3.5 mr-1" />
                          Flag
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No content matches your filters.
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
            disabled={currentPage <= 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
