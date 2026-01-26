"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new query page
    router.replace("/queries/chat/new");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
