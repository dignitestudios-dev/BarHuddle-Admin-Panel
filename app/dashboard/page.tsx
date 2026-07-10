"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  MapPin,
  CalendarCheck2,
  UserPlus,
  Building2,
  MessageSquare,
  UserRoundPlus,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartActivityTrends } from "@/components/charts-and-graphs/ChartActivityTrends";
import { cn } from "@/lib/utils";
import { getDashboardApi, type DashboardData } from "@/lib/api/auth.api";

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="border animate-pulse">
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-7 w-16 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Single Stat Card ──────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  badgeColor?: string;
}

function StatCard({ title, value, sub, icon: Icon, color, badge, badgeColor }: StatCardProps) {
  return (
    <Card className="border hover:shadow-md transition-shadow duration-200">
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-lg p-2", color)}>
            <Icon className="size-5" />
          </div>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                badgeColor
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          <div className="text-muted-foreground text-xs">{sub}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Analytics Row Card ────────────────────────────────────────────────────────
interface AnalyticItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}

function AnalyticItem({ icon: Icon, label, value, color }: AnalyticItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-1.5", color)}>
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDashboardApi();
      setData(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Stat cards derived from real API data ────────────────────────────────────
  const statCards: StatCardProps[] = data
    ? [
        {
          title: "Total Users",
          value: data.totalUsers.toLocaleString(),
          sub: "Registered on the platform",
          icon: Users,
          color: "text-blue-600 bg-blue-50",
          badge: "All time",
          badgeColor: "border-blue-200 bg-blue-50 text-blue-700",
        },
        {
          title: "Active Users",
          value: data.activeUsers.toLocaleString(),
          sub: "Currently active accounts",
          icon: UserCheck,
          color: "text-green-600 bg-green-50",
          badge: "Live",
          badgeColor: "border-green-200 bg-green-50 text-green-700",
        },
        {
          title: "At Venues Now",
          value: data.attendance.currentlyAtVenues.toLocaleString(),
          sub: `${data.attendance.todayCheckIns} check-ins today`,
          icon: MapPin,
          color: "text-orange-600 bg-orange-50",
          badge: "Attendance",
          badgeColor: "border-orange-200 bg-orange-50 text-orange-700",
        },
        {
          title: "Today's Check-ins",
          value: data.attendance.todayCheckIns.toLocaleString(),
          sub: "Venue check-ins logged today",
          icon: CalendarCheck2,
          color: "text-purple-600 bg-purple-50",
          badge: "Today",
          badgeColor: "border-purple-200 bg-purple-50 text-purple-700",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live overview of your platform activity
          </p>
        </div>
        {!loading && (
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            className="gap-2"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="ml-4 gap-1.5 text-red-700 border-red-300 hover:bg-red-100">
            <RefreshCcw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Weekly Analytics + Activity Trends row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Weekly Analytics breakdown */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week's Activity</CardTitle>
            <CardDescription>Analytics for the current 7-day window</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : data ? (
              <>
                <AnalyticItem
                  icon={UserPlus}
                  label="New Users"
                  value={data.analytics.newUsersThisWeek}
                  color="text-blue-600 bg-blue-50"
                />
                <AnalyticItem
                  icon={Building2}
                  label="Venue Visits"
                  value={data.analytics.venueVisitsThisWeek}
                  color="text-orange-600 bg-orange-50"
                />
                <AnalyticItem
                  icon={MessageSquare}
                  label="Messages Sent"
                  value={data.analytics.messagesThisWeek}
                  color="text-green-600 bg-green-50"
                />
                <AnalyticItem
                  icon={UserRoundPlus}
                  label="Friend Requests"
                  value={data.analytics.friendRequestsThisWeek}
                  color="text-purple-600 bg-purple-50"
                />
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Activity Trends Chart — spans 2 columns */}
        <div className="lg:col-span-2">
          <ChartActivityTrends />
        </div>
      </div>
    </div>
  );
}
