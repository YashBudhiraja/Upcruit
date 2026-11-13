"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-600 hover:bg-red-100"
    >
      Log Out
    </button>
  );
}