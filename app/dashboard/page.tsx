import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

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

  // CANDIDATE DASHBOARD
  if (profile.role === "candidate") {
    const { data: candidate } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (
      <main className="min-h-screen bg-[#fafaff] p-8 text-[#17172b]">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
          <LogoutButton />
        </header>

        <section className="mx-auto mt-12 max-w-6xl">
          <h2 className="text-3xl font-black">
            Welcome back, {profile.full_name}!
          </h2>
          <p className="mt-2 text-gray-500">
            Your career journey starts here.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Discover Jobs", "Find opportunities that match your skills."],
              ["My Interests", "Track the jobs you've shown interest in."],
              ["My Matches", "Connect with recruiters who match with you."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-white p-7 shadow-md">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-3 text-gray-500">{description}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-violet-600">
                  Coming soon
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">
            <h3 className="text-xl font-bold">Your Profile</h3>
            <p className="mt-4 text-gray-600">
              <strong>Headline:</strong> {candidate?.headline || "Not added"}
            </p>
            <p className="mt-3 text-gray-600">
              <strong>Location:</strong> {candidate?.location || "Not added"}
            </p>
            <p className="mt-3 text-gray-600">
              <strong>Experience:</strong> {candidate?.experience_years ?? 0} years
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

  // RECRUITER DASHBOARD
  const { data: recruiter } = await supabase
    .from("recruiter_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[#fafaff] p-8 text-[#17172b]">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
        <LogoutButton />
      </header>

      <section className="mx-auto mt-12 max-w-6xl">
        <h2 className="text-3xl font-black">
          Welcome back, {profile.full_name}!
        </h2>

        <p className="mt-2 text-gray-500">
          Find talent. Build your team. Hire smarter.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["Post a Job", "Create and publish new job opportunities."],
            ["Manage Jobs", "View and manage your posted jobs."],
            ["Discover Candidates", "Find candidates who match your requirements."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl bg-white p-7 shadow-md">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-gray-500">{description}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-violet-600">
                Coming soon
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-md">
          <h3 className="text-xl font-bold">Company Profile</h3>

          <p className="mt-4 text-gray-600">
            <strong>Company:</strong> {recruiter?.company_name || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Designation:</strong> {recruiter?.designation || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Website:</strong> {recruiter?.company_website || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>Location:</strong> {recruiter?.location || "Not added"}
          </p>

          <p className="mt-3 text-gray-600">
            <strong>About:</strong>{" "}
            {recruiter?.company_description || "Not added"}
          </p>
        </div>
      </section>
    </main>
  );
}