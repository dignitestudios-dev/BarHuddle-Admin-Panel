"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { updatePasswordApi } from "@/lib/api/auth.api";

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Simple password strength calculation
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("New password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("New password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("New password must contain at least one special character.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setLoading(true);
    try {
      await updatePasswordApi({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update password. Please check your current password and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl  border bg-card shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold">Change Password</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Choose a strong password you haven't used before.
          </p>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Password updated successfully!
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${strength >= level
                          ? strengthColors[strength]
                          : "bg-muted"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Strength:{" "}
                  <span
                    className={`font-medium ${strength === 1
                        ? "text-red-500"
                        : strength === 2
                          ? "text-yellow-500"
                          : strength === 3
                            ? "text-blue-500"
                            : "text-green-500"
                      }`}
                  >
                    {strengthLabels[strength] || "Too short"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={`pr-10 ${confirmPassword.length > 0 && confirmPassword !== newPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : confirmPassword.length > 0 && confirmPassword === newPassword
                      ? "border-green-400 focus-visible:ring-green-400"
                      : ""
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          {/* Requirements hint */}
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
              At least 8 characters
            </li>
            <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
              At least one uppercase letter
            </li>
            <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>
              At least one number
            </li>
            <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : ""}>
              At least one special character
            </li>
          </ul>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="min-w-36">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecuritySettings;
