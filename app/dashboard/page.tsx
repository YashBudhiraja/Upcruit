import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="p-10">
        Profile not found. Please contact support.
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaff] p-6 text-[#17172b]">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">

        <h1 className="text-3xl font-black">
          Welcome, {profile.full_name}!
        </h1>

        <p className="mt-4 text-gray-500">
          You are logged in as a{" "}
          <span className="font-bold capitalize text-violet-600">
            {profile.role}
          </span>.
        </p>

        <p className="mt-6 text-sm text-gray-400">
          Welcome to your Upcruit workspace.
        </p>

        <div className="mt-8">
          <LogoutButton />
        </div>

      </div>
    </main>
  );
}