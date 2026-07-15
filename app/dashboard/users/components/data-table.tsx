"use client";

import { useState } from "react";
import {
  EllipsisVertical,
  Eye,
  Trash2,
  Search,
  Ban,
  CheckCircle2,
  Activity,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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
import { type AdminUser } from "@/lib/api/auth.api";

interface DataTableProps {
  users: AdminUser[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
  filter: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFilterChange: (filter: string) => void;
  onBanUser: (id: string) => void;
  onUnbanUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export function DataTable({
  users,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  loading,
  filter,
  searchQuery,
  onSearchQueryChange,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
}: DataTableProps) {
  // Get initials for Avatar fallback
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

  const getStatusColor = (isDeactivated: boolean) => {
    return isDeactivated
      ? "text-red-700 bg-red-50 border-red-200"
      : "text-green-700 bg-green-50 border-green-200";
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "text-purple-700 bg-purple-50 border-purple-200";
      default:
        return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  // Backend is doing all searching and filtering, so we display the users array directly
  const displayedUsers = users;

  return (
    <div className="w-full space-y-4">
      {/* Top bar: title + export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">User List</h2>
          <p className="text-muted-foreground text-sm">
            {totalItems} user{totalItems !== 1 ? "s" : ""} in total
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            id="user-search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter */}
        <div className="space-y-1">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="banned">Banned Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Profile Complete</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading users...
                  </div>
                </TableCell>
              </TableRow>
            ) : displayedUsers.length ? (
              displayedUsers.map((user) => (
                <TableRow
                  key={user._id}
                  className={user.isDeactivatedByAdmin ? "opacity-60 bg-muted/20" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {user.profilePicture?.location && (
                          <AvatarImage
                            src={user.profilePicture.location}
                            alt={user.name || user.email}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {user.name || "No Name"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.isEmailVerified
                          ? "text-green-700 bg-green-50 border-green-200"
                          : "text-orange-700 bg-orange-50 border-orange-200"
                      }
                    >
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.isProfileCompleted
                          ? "text-blue-700 bg-blue-50 border-blue-200"
                          : "text-gray-700 bg-gray-50 border-gray-200"
                      }
                    >
                      {user.isProfileCompleted ? "Completed" : "Incomplete"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(user.isDeactivatedByAdmin)}>
                      {user.isDeactivatedByAdmin ? "Deactivated" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* View Profile */}
                      <Link href={`/dashboard/users/${user._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          title="View Profile"
                        >
                          <UserIcon className="size-4 " />
                          <span className="sr-only">View profile</span>
                        </Button>
                      </Link>

                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                          >
                            <EllipsisVertical className="size-4 " />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/users/${user._id}`}>
                              <Eye className="mr-2 size-4 hover:text-white" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/dashboard/users/${user._id}/activity`}>
                              <Activity className="mr-2 size-4 hover:text-white" />
                              Activity Logs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isDeactivatedByAdmin ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-green-600 focus:text-green-600 font-medium"
                              onClick={() => onUnbanUser(user._id)}
                            >
                              <CheckCircle2 className="mr-2 size-4 hover:text-white" />
                              Activate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer hover:text-white text-red-600  font-medium"
                              onClick={() => onBanUser(user._id)}
                            >
                              <Ban className="mr-2 size-4 hover:text-white" />
                              Deactivate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem
                            className="cursor-pointer text-red-700 focus:text-red-700 bg-red-50/50"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this user?")) {
                                onDeleteUser(user._id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete User
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Show
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="w-20 cursor-pointer" id="page-size">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="hidden sm:flex items-center space-x-2">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {currentPage} of {totalPages}
            </strong>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
