export const instant = false;
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";
import NotificationBell from "@/components/notification-bell";

function DashboardCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-xl font-bold group-hover:text-violet-700">
        {title}
      </h3>
      <p className="mt-3 text-gray-500">{description}</p>
      <span className="mt-5 inline-block text-sm font-bold text-violet-600">
        Open →
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const header = (
    <header className="flex items-center justify-between">
      <Link href="/dashboard" className="text-2xl font-black text-violet-700">
        Upcruit
      </Link>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <LogoutButton />
      </div>
    </header>
  );

  if (profile.role === "candidate") {
    const { data: candidate } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (
      <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b] md:p-8">
        {header}

        <section className="mx-auto mt-12 max-w-6xl">
          <h2 className="text-3xl font-black">
            Welcome back, {profile.full_name}!
          </h2>

          <p className="mt-2 text-gray-500">
            Your career journey starts here.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <DashboardCard
              title="Discover Jobs"
              description="Find opportunities that match your skills."
              href="/jobs"
              icon="💼"
            />

            <DashboardCard
              title="My Matches"
              description="Connect with recruiters who match with you."
              href="/matches"
              icon="📇"
            />

            <DashboardCard
              title="Messages"
              description="Chat with your matched recruiters."
              href="/messages"
              icon="💬"
            />
          </div>

          <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold">Your Profile</h3>

              <Link
                href="/onboarding"
                className="rounded-lg bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-200"
              >
                Edit Profile →
              </Link>
            </div>

            <p className="mt-5 text-gray-600">
              <strong>Headline:</strong> {candidate?.headline || "Not added"}
            </p>

            <p className="mt-3 text-gray-600">
              <strong>Location:</strong> {candidate?.location || "Not added"}
            </p>

            <p className="mt-3 text-gray-600">
              <strong>Experience:</strong>{" "}
              {candidate?.experience_years ?? 0} years
            </p>

            <p className="mt-3 text-gray-600">
              <strong>Skills:</strong>{" "}
              {candidate?.skills?.join(", ") || "Not added"}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { data: recruiter } = await supabase
    .from("recruiter_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b] md:p-8">
      {header}

      <section className="mx-auto mt-12 max-w-6xl">
        <h2 className="text-3xl font-black">
          Welcome back, {profile.full_name}!
        </h2>

        <p className="mt-2 text-gray-500">
          Find talent. Build your team. Hire smarter.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashboardCard
            title="Post a Job"
            description="Create and publish new job opportunities."
            href="/jobs/create"
            icon="📝"
          />

          <DashboardCard
            title="Manage Jobs"
            description="View and manage your posted jobs."
            href="/jobs/manage"
            icon="📋"
          />

          <DashboardCard
            title="Discover Candidates"
            description="Find candidates who match your requirements."
            href="/candidates"
            icon="👥"
          />

          <DashboardCard
            title="My Matches"
            description="View candidates who mutually match with you."
            href="/matches"
            icon="📇"
          />

          <DashboardCard
            title="Messages"
            description="Chat with your matched candidates."
            href="/messages"
            icon="💬"
          />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">
          <h3 className="text-xl font-bold">Company Profile</h3>

          <p className="mt-4 text-gray-600">
            <strong>Company:</strong>{" "}
            {recruiter?.company_name || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Designation:</strong>{" "}
            {recruiter?.designation || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Website:</strong>{" "}
            {recruiter?.company_website || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Location:</strong>{" "}
            {recruiter?.location || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>About:</strong>{" "}
            {recruiter?.company_description || "Not added"}
          </p>

          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-lg bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-200"
          >
            Edit Company Profile →
          </Link>
        </div>
      </section>
    </main>
  );
}