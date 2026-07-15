"use client";

import { useRouter } from "next/navigation";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  MapPin,
  Search,
  RefreshCcw,
  Building2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getUserActivityApi,
  getUserByIdApi,
  type AdminUser,
  type ActivityFilter,
  type HistoryActivityResponse,
  type FriendsActivityResponse,
  type MessagesActivityResponse,
  type AttendanceItem,
  type FriendItem,
  type MessageItem,
} from "@/lib/api/auth.api";

const PAGE_SIZE = 20;

export default function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // User profile
  const [user, setUser] = useState<AdminUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Active tab / filter — default is "history"
  const [activeTab, setActiveTab] = useState<ActivityFilter>("history");

  // Per-filter data
  const [historyData, setHistoryData] = useState<AttendanceItem[]>([]);
  const [historyPagination, setHistoryPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  const [friendsData, setFriendsData] = useState<FriendItem[]>([]);
  const [friendsPagination, setFriendsPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  const [messagesData, setMessagesData] = useState<MessageItem[]>([]);
  const [messagesPagination, setMessagesPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [totalMessages, setTotalMessages] = useState(0);

  // Per-filter loading/error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Local search
  const [friendSearch, setFriendSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");

  // ── Load user profile once ────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const res = await getUserByIdApi(id);
        if (res?.success) setUser(res.data);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  // ── Fetch activity for the active filter ─────────────────────────
  const fetchActivity = useCallback(
    async (filter: ActivityFilter, page: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserActivityApi(id, filter, page, PAGE_SIZE);
        if (!res?.success) {
          setError(res?.message || "Failed to load activity.");
          return;
        }

        if (filter === "history") {
          const d = res.data as HistoryActivityResponse;
          setHistoryData(d.data ?? []);
          setHistoryPagination({
            currentPage: d.pagination.currentPage,
            totalPages: d.pagination.totalPages,
            totalItems: d.pagination.totalItems,
          });
        } else if (filter === "friends") {
          const d = res.data as FriendsActivityResponse;
          setFriendsData(d.data ?? []);
          setFriendsPagination({
            currentPage: d.pagination.currentPage,
            totalPages: d.pagination.totalPages,
            totalItems: d.pagination.totalItems,
          });
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to fetch activity data."
        );
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  // Fetch when tab or page changes
  useEffect(() => {
    const page =
      activeTab === "history"
        ? historyPagination.currentPage
        : activeTab === "friends"
          ? friendsPagination.currentPage
          : messagesPagination.currentPage;

    fetchActivity(activeTab, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ActivityFilter);
    setError("");
  };

  const handleRefresh = () => {
    const page =
      activeTab === "history"
        ? historyPagination.currentPage
        : activeTab === "friends"
          ? friendsPagination.currentPage
          : messagesPagination.currentPage;
    fetchActivity(activeTab, page);
  };

  const handlePageChange = (filter: ActivityFilter, page: number) => {
    fetchActivity(filter, page);
  };

  // ── Helpers ───────────────────────────────────────────────────────
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

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Filtered lists (local search)
  const filteredFriends = friendsData.filter((f) => {
    const q = friendSearch.toLowerCase();
    return f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q);
  });

  const filteredMessages = messagesData.filter((m) =>
    m.content?.toLowerCase().includes(messageSearch.toLowerCase())
  );

  // Pagination helper
  const PaginationBar = ({
    filter,
    currentPage,
    totalPages,
    totalItems,
  }: {
    filter: ActivityFilter;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }) => (
    <div className="flex items-center justify-between px-2 py-3 border-t text-xs text-muted-foreground">
      <span>{totalItems} total record{totalItems !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={currentPage <= 1 || loading}
          onClick={() => handlePageChange(filter, currentPage - 1)}
        >
          Previous
        </Button>
        <span className="font-medium text-foreground">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={currentPage >= totalPages || loading}
          onClick={() => handlePageChange(filter, currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );

  // ── Guards ────────────────────────────────────────────────────────
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center max-w-md mx-auto">
        <div className="text-red-500 bg-red-50 p-3 rounded-full">
          <ArrowLeft className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground text-sm">{error || "User data could not be loaded."}</p>
        <Link href="/dashboard/users">
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
              <ArrowLeft className="size-4" />
              Users
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/dashboard/users/${user._id}`}>
            <Button variant="ghost" size="sm" className="cursor-pointer text-muted-foreground">
              {user.name || user.email}
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Activity Logs</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Venue Check-ins</p>
              <div className="text-2xl font-bold">{historyPagination.totalItems}</div>
              <p className="text-xs text-muted-foreground">Attendance records</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <MapPin className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Friends</p>
              <div className="text-2xl font-bold">{friendsPagination.totalItems}</div>
              <p className="text-xs text-muted-foreground">Active friendships</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Messages</p>
              <div className="text-2xl font-bold">{messagesPagination.totalItems}</div>
              <p className="text-xs text-muted-foreground">Total messages</p>
            </div>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Tabs — defaultValue matches the default filter "history" */}
      <Tabs defaultValue="history" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:max-w-md">
          <TabsTrigger value="history">Attendance History</TabsTrigger>
          <TabsTrigger value="friends">Friends List</TabsTrigger>
          {/* <TabsTrigger value="message">Messages</TabsTrigger> */}
        </TabsList>

        {/* ── Attendance History Tab ── */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Venue Attendance History</CardTitle>
              <CardDescription>Check-in and checkout records for this user</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading attendance records...
                </div>
              ) : (
                <>
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Venue</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Check-in Time</TableHead>
                          <TableHead>Checkout Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData.length ? (
                          historyData.map((item) => (
                            <TableRow key={item._id}>
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  <Building2 className="size-4 text-orange-500" />
                                  {item.venueName || item.venue?.name || "—"}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.venue?.address}>
                                {item.venue?.address || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(item.checkInTime)}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(item.checkoutTime)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                                  {item.isActive ? "Active" : "Left"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                              No attendance records found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationBar
                    filter="history"
                    currentPage={historyPagination.currentPage}
                    totalPages={historyPagination.totalPages}
                    totalItems={historyPagination.totalItems}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Friends Tab ── */}
        <TabsContent value="friends" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Connected Friends</CardTitle>
                <CardDescription>Accounts connected through friendships</CardDescription>
              </div>
              <div className="relative max-w-xs">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search friends..."
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading friends...
                </div>
              ) : (
                <>
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Profile</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Date of Birth</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFriends.length ? (
                          filteredFriends.map((friend) => (
                            <TableRow
                              key={friend._id}
                              className="cursor-pointer hover:bg-muted/60 transition-colors"
                              onClick={() => router.push(`/dashboard/users/${friend._id}`)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {friend.profilePicture?.location && (
                                      <AvatarImage
                                        src={friend.profilePicture.location}
                                        alt={friend.name || friend.email}
                                        className="object-cover"
                                      />
                                    )}
                                    <AvatarFallback className="text-xs font-semibold">
                                      {getInitials(friend.name, friend.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{friend.name || "No Name"}</span>
                                    <span className="text-xs text-muted-foreground">{friend.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-medium capitalize">
                                {friend.gender || "Not Specified"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {friend.dob ? new Date(friend.dob).toLocaleDateString() : "—"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                              {friendSearch ? "No friends match your search." : "No friendships found."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationBar
                    filter="friends"
                    currentPage={friendsPagination.currentPage}
                    totalPages={friendsPagination.totalPages}
                    totalItems={friendsPagination.totalItems}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Messages Tab ── */}
        <TabsContent value="message" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Message Logs</CardTitle>
                <CardDescription>Recent messages sent by this user</CardDescription>
              </div>
              <div className="relative max-w-xs">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search messages..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-32 gap-2 text-sm text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Loading messages...
                </div>
              ) : (
                <>
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Message</TableHead>
                          <TableHead>Chat Room</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              Timestamp
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMessages.length ? (
                          filteredMessages.map((msg) => (
                            <TableRow key={msg._id}>
                              <TableCell className="text-sm max-w-[260px] truncate" title={msg.content}>
                                {msg.content}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {msg.chatRoom?.name || (msg.chatRoom?.isGroup ? "Group Chat" : "Direct Message")}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {msg.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(msg.timestamp)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                              {messageSearch ? "No messages match your search." : "No messages found."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <PaginationBar
                    filter="message"
                    currentPage={messagesPagination.currentPage}
                    totalPages={messagesPagination.totalPages}
                    totalItems={messagesPagination.totalItems}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
