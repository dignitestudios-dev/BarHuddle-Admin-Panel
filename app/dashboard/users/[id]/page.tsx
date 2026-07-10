"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Shield,
  Activity,
  Ban,
  CheckCircle2,
  CalendarDays,
  User as UserIcon,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getUserByIdApi,
  banUserApi,
  unbanUserApi,
  deleteUserApi,
  type AdminUser,
} from "@/lib/api/auth.api";
import { useRouter } from "next/navigation";
import { BanUserDialog } from "../components/ban-user-dialog";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Ban Dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUserByIdApi(id);
      if (response?.success && response?.data) {
        setUser(response.data);
      } else {
        setError(response?.message || "User data could not be retrieved.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load user profile. Make sure the user ID is correct and you have permission."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleDeactivateToggle = async () => {
    if (!user) return;
    if (!user.isDeactivatedByAdmin) {
      setBanDialogOpen(true);
    } else {
      setActionLoading(true);
      try {
        const res = await unbanUserApi(user._id);
        if (res?.success) {
          setUser({
            ...user,
            isDeactivatedByAdmin: false,
            banReason: null,
          });
        }
      } catch (err) {
        alert("Failed to activate user.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleConfirmBan = async (reason: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const res = await banUserApi(user._id, reason);
      if (res?.success) {
        setUser({
          ...user,
          isDeactivatedByAdmin: true,
          banReason: reason,
        });
      }
    } catch (err) {
      alert("Failed to deactivate user.");
    } finally {
      setActionLoading(false);
      setBanDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) {
      setActionLoading(true);
      try {
        const res = await deleteUserApi(user._id);
        if (res?.success) {
          router.push("/dashboard/users");
        }
      } catch (err) {
        alert("Failed to delete user.");
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">Fetching user profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <div className="rounded-full bg-red-50 p-3 text-red-500">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-semibold">Failed to load user</h2>
        <p className="text-muted-foreground text-sm">{error || "User not found"}</p>
        <Link href="/dashboard/users">
          <Button variant="outline">
            <ArrowLeft className="mr-2 size-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

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

  const formattedDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return "Not specified";
    switch (gender.toLowerCase()) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "nonbinary":
        return "Non-Binary";
      default:
        return gender;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
            <ArrowLeft className="size-4" />
            Users
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{user.name || user.email}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border shadow-sm">
          <CardContent className="flex flex-col items-center gap-5 pt-8 text-center">
            <Avatar className="h-24 w-24 border shadow-sm">
              {user.profilePicture?.location && (
                <AvatarImage
                  src={user.profilePicture.location}
                  alt={user.name || user.email}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-2xl font-bold">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name || "No Name"}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.isDeactivatedByAdmin && user.banReason && (
                <div className="mt-2.5 text-xs text-red-700 bg-red-50/50 border border-red-200 px-3 py-1.5 rounded-lg max-w-xs mx-auto text-left">
                  <span className="font-semibold block">Deactivation Reason:</span>
                  <span className="text-muted-foreground">{user.banReason}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge
                variant="outline"
                className={
                  user.role?.toLowerCase() === "admin"
                    ? "text-purple-700 bg-purple-50 border-purple-200"
                    : "text-blue-700 bg-blue-50 border-blue-200"
                }
              >
                {user.role}
              </Badge>
              <Badge
                variant="outline"
                className={
                  user.isDeactivatedByAdmin
                    ? "text-red-700 bg-red-50 border-red-200"
                    : "text-green-700 bg-green-50 border-green-200"
                }
              >
                {user.isDeactivatedByAdmin ? "Deactivated" : "Active"}
              </Badge>
            </div>
            <Separator />
            <div className="flex gap-2 w-full flex-col">
              <Link href={`/dashboard/users/${user._id}/activity`} className="w-full">
                <Button variant="outline" className="w-full cursor-pointer">
                  <Activity className="mr-2 size-4" />
                  View Activity Logs
                </Button>
              </Link>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={handleDeactivateToggle}
                className={`w-full cursor-pointer ${
                  user.isDeactivatedByAdmin
                    ? "text-green-600 border-green-200 hover:bg-green-50"
                    : "text-orange-600 border-orange-200 hover:bg-orange-50"
                }`}
              >
                {user.isDeactivatedByAdmin ? (
                  <>
                    <CheckCircle2 className="mr-2 size-4" />
                    Activate Account
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 size-4" />
                    Deactivate Account
                  </>
                )}
              </Button>
              {/* <Button
                variant="destructive"
                disabled={actionLoading}
                onClick={handleDelete}
                className="w-full cursor-pointer"
              >
                <Trash2 className="mr-2 size-4" />
                Delete Account
              </Button> */}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Personal & Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Mail className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Shield className="size-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Security Role</p>
                  <p className="text-sm font-semibold capitalize text-foreground">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <Calendar className="size-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Joined Date</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <Clock className="size-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Last Profile Update</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDate(user.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-50 p-2">
                  <CalendarDays className="size-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Date of Birth</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDate(user.dob)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-50 p-2">
                  <UserIcon className="size-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Gender</p>
                  <p className="text-sm font-semibold text-foreground">
                    {getGenderLabel(user.gender)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status Cards */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">System Check & Statuses</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-2">
              <div className="rounded-xl border p-4 flex flex-col justify-between h-24">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Email Verification
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {user.isEmailVerified ? "Verified" : "Pending"}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      user.isEmailVerified
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }
                  >
                    {user.isEmailVerified ? "Success" : "Action Required"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border p-4 flex flex-col justify-between h-24">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Profile Completion
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {user.isProfileCompleted ? "Completed" : "Incomplete"}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      user.isProfileCompleted
                        ? "text-blue-700 bg-blue-50 border-blue-200"
                        : "text-gray-700 bg-gray-50 border-gray-200"
                    }
                  >
                    {user.isProfileCompleted ? "Completed" : "Draft"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onConfirm={handleConfirmBan}
        userName={user.name || user.email}
      />
    </div>
  );
}
