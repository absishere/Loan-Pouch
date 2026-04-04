"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Route protection — hackathon-grade guard using localStorage
    const isRegistered = localStorage.getItem("lp_wallet_registered");
    if (!isRegistered) {
      router.replace("/"); // kick to landing if not registered
    }
  }, [router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
