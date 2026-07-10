"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, TrendingUp } from "lucide-react";
import {
  getActivityTrendsApi,
  type TrendPeriod,
  type TrendPoint,
} from "@/lib/api/auth.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(raw: string | null, period: TrendPeriod): string {
  if (!raw) return "Unknown";
  try {
    // Parse as UTC to avoid timezone shifts (date strings are YYYY-MM-DD)
    const [y, m, d] = raw.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (isNaN(date.getTime())) return raw;
    if (period === "monthly")
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  } catch {
    return raw;
  }
}

interface ChartPoint {
  label: string;
  newUsers: number;
  venueVisits: number;
  messages: number;
}

function transformTrends(trends: TrendPoint[], period: TrendPeriod): ChartPoint[] {
  return trends
    .filter((t) => t.date !== null) // drop null-date entries
    .map((t) => ({
      label: formatDate(t.date, period),
      newUsers: t.newUsers ?? 0,
      venueVisits: t.venueVisits ?? 0,
      messages: t.messages ?? 0,
    }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-medium tabular-nums">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Period Tab Button ────────────────────────────────────────────────────────
function PeriodBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ChartActivityTrends() {
  const [period, setPeriod] = useState<TrendPeriod>("daily");
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrends = useCallback(async (p: TrendPeriod) => {
    setLoading(true);
    setError("");
    try {
      const result = await getActivityTrendsApi(p);
      setChartData(transformTrends(result.trends, p));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load activity trends."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(period);
  }, [period, fetchTrends]);

  const periods: { key: TrendPeriod; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
  ];

  // Totals for footer summary
  const totals = chartData.reduce(
    (acc, d) => ({
      newUsers: acc.newUsers + d.newUsers,
      venueVisits: acc.venueVisits + d.venueVisits,
      messages: acc.messages + d.messages,
    }),
    { newUsers: 0, venueVisits: 0, messages: 0 }
  );

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Activity Trends
            </CardTitle>
            <CardDescription className="mt-0.5">
              New users · Venue visits · Messages over time
            </CardDescription>
          </div>
          {/* Period selector + refresh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border p-0.5 bg-muted/40">
              {periods.map((p) => (
                <PeriodBtn
                  key={p.key}
                  label={p.label}
                  active={period === p.key}
                  onClick={() => setPeriod(p.key)}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => fetchTrends(period)}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Error */}
        {error && (
          <div className="text-center py-8 text-sm text-red-500">{error}</div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="flex items-center justify-center h-[260px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Chart */}
        {!loading && !error && chartData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradVenueVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  name="newUsers"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#gradNewUsers)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="venueVisits"
                  name="venueVisits"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="url(#gradVenueVisits)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  name="messages"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  fill="url(#gradMessages)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend + totals */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" />
                  <span className="text-muted-foreground">New Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]" />
                  <span className="text-muted-foreground">Venue Visits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--chart-3)]" />
                  <span className="text-muted-foreground">Messages</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Users: <strong className="text-foreground">{totals.newUsers}</strong></span>
                <span>Visits: <strong className="text-foreground">{totals.venueVisits}</strong></span>
                <span>Msgs: <strong className="text-foreground">{totals.messages}</strong></span>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground text-sm gap-2">
            <TrendingUp className="h-8 w-8 opacity-30" />
            No trend data available for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
