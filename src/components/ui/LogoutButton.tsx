"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span className="text-sm font-medium">Logout</span>
    </button>
  );
}
