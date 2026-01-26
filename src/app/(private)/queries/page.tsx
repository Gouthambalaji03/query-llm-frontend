"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function QueriesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/queries/chat/new");
  }, [router]);

  return null;
}
