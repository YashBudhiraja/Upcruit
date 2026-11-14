"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";

export default function MatchesPage() {
  const router = useRouter();

  const [matches, setMatches] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setRole(profile.role);

      const column =
        profile.role === "candidate" ? "candidate_id" : "recruiter_id";

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq(column, user.id)
        .order("created_at", { ascending: false });

      if (matchError) {
        setError(matchError.message);
        setLoading(false);
        return;
      }

      const records = matchData || [];

      if (records.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const jobIds = [...new Set(records.map((m) => m.job_id))];
      const candidateIds = [...new Set(records.map((m) => m.candidate_id))];
      const recruiterIds = [...new Set(records.map((m) => m.recruiter_id))];

      const [
        { data: jobs },
        { data: candidates },
        { data: recruiters },
        { data: profiles },
      ] = await Promise.all([
        supabase.from("jobs").select("id, title, location").in("id", jobIds),
        supabase.from("candidate_profiles").select("id, headline, skills, location").in("id", candidateIds),
        supabase.from("recruiter_profiles").select("id, company_name").in("id", recruiterIds),
        supabase.from("profiles").select("id, full_name").in("id", profile.role === "candidate" ? recruiterIds : candidateIds),
      ]);

      const enriched = records.map((match) => ({
        ...match,
        job: jobs?.find((j) => j.id === match.job_id),
        candidate: candidates?.find((c) => c.id === match.candidate_id),
        recruiter: recruiters?.find((r) => r.id === match.recruiter_id),
        person: profiles?.find((p) =>
          p.id === (profile.role === "candidate"
            ? match.recruiter_id
            : match.candidate_id)
        ),
      }));

      setMatches(enriched);
      setLoading(false);
    }

    loadMatches();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b] md:p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
        <LogoutButton />
      </header>

      <section className="mx-auto mt-12 max-w-5xl">
        <h2 className="text-3xl font-black">It's a Match! ❤️</h2>
        <p className="mt-2 text-gray-500">
          {role === "candidate"
            ? "Recruiters who are interested in you."
            : "Candidates who match your hiring requirements."}
        </p>

        {loading && <p className="mt-10">Finding your matches...</p>}

        {error && <p className="mt-8 text-red-600">{error}</p>}

        {!loading && !error && matches.length === 0 && (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-md">
            <div className="text-5xl">💜</div>
            <h3 className="mt-5 text-2xl font-bold">No matches yet</h3>
            <p className="mt-3 text-gray-500">
              Keep exploring. Your next match could be around the corner!
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {matches.map((match, index) => (
            <motion.article
              key={match.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-gray-100 bg-white p-7 shadow-md"
            >
              <div className="text-3xl">❤️</div>

              <h3 className="mt-4 text-xl font-black">
                {match.person?.full_name || "Matched User"}
              </h3>

              {role === "candidate" ? (
                <p className="mt-2 text-violet-700">
                  {match.recruiter?.company_name || "Recruiter"}
                </p>
              ) : (
                <>
                  <p className="mt-2 text-violet-700">
                    {match.candidate?.headline || "Candidate"}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {match.candidate?.skills?.join(", ")}
                  </p>
                </>
              )}

              <div className="mt-5 rounded-xl bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase text-violet-500">
                  Matched Job
                </p>
                <p className="mt-2 font-bold">
                  {match.job?.title || "Job"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {match.job?.location || ""}
                </p>
              </div>

              <p className="mt-5 text-xs text-gray-400">
                Matched on{" "}
                {new Date(match.created_at).toLocaleDateString()}
              </p>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}