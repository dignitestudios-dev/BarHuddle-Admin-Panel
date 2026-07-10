"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LogIn,
  Users,
  MessageSquare,
  MapPin,
  Calendar,
  Monitor,
  Search,
  User as UserIcon,
  RefreshCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  type UserActivityData,
  type AdminUser,
} from "@/lib/api/auth.api";

export default function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // User details & Activity states
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activity, setActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search local filters
  const [sessionSearch, setSessionSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch user profile info
      const profileRes = await getUserByIdApi(id);
      if (profileRes?.success) {
        setUser(profileRes.data);
      }

      // Fetch user activities
      const activityRes = await getUserActivityApi(id, currentPage, pageSize);
      if (activityRes?.success) {
        setActivity(activityRes.data);
      } else {
        setError(activityRes?.message || "Failed to load user activity log.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to sync activity records from BarHuddle API."
      );
    } finally {
      setLoading(false);
    }
  }, [id, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
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

  // Filtered account activity
  const filteredSessions = activity?.accountActivity?.filter((session) => {
    const q = sessionSearch.toLowerCase();
    return (
      session.deviceModel?.toLowerCase().includes(q) ||
      session.ipAddress?.includes(q) ||
      session.userAgent?.toLowerCase().includes(q)
    );
  }) || [];

  // Filtered friends
  const filteredFriends = activity?.friends?.filter((friend) => {
    const q = friendSearch.toLowerCase();
    return (
      friend.name?.toLowerCase().includes(q) ||
      friend.email?.toLowerCase().includes(q)
    );
  }) || [];

  if (loading && !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading activity report...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center max-w-md mx-auto">
        <div className="text-red-500 bg-red-50 p-3 rounded-full">
          <ArrowLeft className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Activity profile not found</h2>
        <p className="text-muted-foreground text-sm">{error || "User data mismatch"}</p>
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

        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Activity
        </Button>
      </div>

      {/* Top Activity Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance metric */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Venue Attendance</p>
              <div className="text-2xl font-bold">{activity?.attendanceHistory?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Check-ins in total</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <MapPin className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Friends metric */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Friends Connected</p>
              <div className="text-2xl font-bold">{activity?.friends?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active friendships</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Messaging activity metric */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Messages</p>
              <div className="text-2xl font-bold">{activity?.messagingActivity?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Sent & received</p>
            </div>
            <div className="rounded-lg bg-green-50 p-2 text-green-600">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Sessions activity metric */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Sessions</p>
              <div className="text-2xl font-bold">{activity?.accountActivity?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Connected devices</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <LogIn className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs interface */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:max-w-xl">
          <TabsTrigger value="sessions">Account Sessions</TabsTrigger>
          <TabsTrigger value="friends">Friends list</TabsTrigger>
          <TabsTrigger value="messages">Messaging</TabsTrigger>
          <TabsTrigger value="attendance">Attendance History</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Authentication Sessions</CardTitle>
                <CardDescription>Login sessions and token generations</CardDescription>
              </div>
              <div className="relative max-w-xs">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Filter sessions..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device / Model</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length ? (
                      filteredSessions.map((session) => (
                        <TableRow key={session._id}>
                          <TableCell className="font-semibold flex items-center gap-2">
                            <Monitor className="size-4 text-muted-foreground" />
                            {session.deviceModel || "Unknown Device"}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-foreground">
                            {session.ipAddress}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={session.userAgent}>
                            {session.userAgent}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(session.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No active authentication sessions logged.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends Tab */}
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
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Profile</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFriends.length ? (
                      filteredFriends.map((friend) => (
                        <TableRow key={friend._id}>
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
                          <TableCell>
                            <Link href={`/dashboard/users/${friend._id}`}>
                              <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer">
                                View Profile
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No friendships logged.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messages" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Messaging Logs</CardTitle>
              <CardDescription>Recent messaging logs and volume logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border p-6 flex items-center justify-between max-w-sm mb-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                    Total Sent Messages
                  </span>
                  <span className="text-3xl font-extrabold">{activity?.messagingActivity?.totalMessages || 0}</span>
                </div>
                <MessageSquare className="size-8 text-muted-foreground opacity-30" />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message Log</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity?.messagingActivity?.recentMessages?.length ? (
                      activity.messagingActivity.recentMessages.map((msg, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{msg.text || "Direct message"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                          No recent messaging logs found on the server.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-4 space-y-4">
          <Card className="border">
            <CardHeader>
              <CardTitle className="text-base">Venue Attendance History</CardTitle>
              <CardDescription>Venues check-ins and attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Venue Name</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Checkout Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity?.attendanceHistory?.length ? (
                      activity.attendanceHistory.map((history, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold flex items-center gap-2">
                            <MapPin className="size-4 text-orange-600" />
                            {history.venueName || "Venue Check-in"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(history.checkIn)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(history.checkOut)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No attendance or check-in history found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
