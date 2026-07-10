import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Clock5,
} from "lucide-react";

export function StatCards({
  totalUsers = 0,
  activeUsers = 0,
}: {
  totalUsers?: number;
  activeUsers?: number;
}) {
  const deactivatedUsers = totalUsers - activeUsers;

  const performanceMetrics = [
    {
      title: "Total Users",
      current: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Active Users",
      current: activeUsers.toLocaleString(),
      icon: UserCheck,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Deactivated Users",
      current: deactivatedUsers >= 0 ? deactivatedUsers.toLocaleString() : "0",
      icon: UserX,
      color: "text-gray-600 bg-gray-50",
    },
    {
      title: "Active Rate",
      current: totalUsers > 0 ? `${((activeUsers / totalUsers) * 100).toFixed(1)}%` : "0%",
      icon: Clock5,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index} className="border">
          <CardContent className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                {metric.title}
              </span>
              <div className={`rounded-lg p-2 ${metric.color}`}>
                <metric.icon className="size-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold">{metric.current}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
