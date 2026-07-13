"use client";

import { useEffect, useState, useCallback } from "react";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import {
  getUsersApi,
  getDashboardApi,
  banUserApi,
  unbanUserApi,
  deleteUserApi,
  type AdminUser,
} from "@/lib/api/auth.api";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BanUserDialog } from "./components/ban-user-dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stats from dashboard API
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Ban Dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [userToBan, setUserToBan] = useState<{ id: string; name: string } | null>(null);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset to first page when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filter]);

  const fetchStats = async () => {
    try {
      const dbStats = await getDashboardApi();
      setTotalUsers(dbStats.totalUsers);
      setActiveUsers(dbStats.activeUsers);
    } catch (err) {
      console.error("Failed to load dashboard stats in users list:", err);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getUsersApi(currentPage, pageSize, filter, debouncedSearchQuery);
      if (response?.success) {
        setUsers(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalItems(response.pagination.totalItems || 0);
        }
      } else {
        setError(response?.message || "Failed to retrieve user data.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "An error occurred while loading users. Please make sure you are authenticated."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filter, debouncedSearchQuery]);

  // Load both stats and list on mount & when params update
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleBanUser = (id: string) => {
    const targetUser = users.find((u) => u._id === id);
    if (!targetUser) return;
    setUserToBan({ id, name: targetUser.name || targetUser.email });
    setBanDialogOpen(true);
  };

  const handleConfirmBan = async (reason: string) => {
    if (!userToBan) return;
    const { id } = userToBan;
    try {
      const res = await banUserApi(id, reason);
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isDeactivatedByAdmin: true, banReason: reason } : u))
        );
        setActiveUsers((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      alert("Failed to deactivate user. Please try again.");
    } finally {
      setBanDialogOpen(false);
      setUserToBan(null);
    }
  };

  const handleUnbanUser = async (id: string) => {
    try {
      const res = await unbanUserApi(id);
      if (res?.success) {
        // Toggle local state
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isDeactivatedByAdmin: false, banReason: null } : u))
        );
        setActiveUsers((prev) => prev + 1);
      }
    } catch (err) {
      alert("Failed to activate user. Please try again.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await deleteUserApi(id);
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setTotalItems((prev) => Math.max(0, prev - 1));
        fetchStats();
      }
    } catch (err) {
      alert("Failed to delete user. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header section with manual refresh */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your application users, verify accounts, and moderate access.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats();
            fetchUsers();
          }}
          className="gap-2"
          disabled={loading}
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh List
        </Button>
      </div>

      {error && (
        <div className="mx-4 lg:mx-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="@container/main px-4 lg:px-6">
        <StatCards totalUsers={totalUsers} activeUsers={activeUsers} />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-6">
        <DataTable
          users={users}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          loading={loading}
          filter={filter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilterChange={handleFilterChange}
          onBanUser={handleBanUser}
          onUnbanUser={handleUnbanUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>

      <BanUserDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onConfirm={handleConfirmBan}
        userName={userToBan?.name || ""}
      />
    </div>
  );
}
