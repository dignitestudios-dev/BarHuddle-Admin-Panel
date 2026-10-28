"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isInitialized) {
      router.replace(isAuthenticated ? "/dashboard" : "/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-lg text-gray-700">Redirecting...</p>
      </div>
    </div>
  );
}
