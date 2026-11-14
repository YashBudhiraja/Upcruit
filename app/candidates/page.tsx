"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";

type Candidate = {
  id: string;
  headline: string;
  bio: string;
  skills: string[];
  experience_years: number;
  education: string;
  location: string;
};

export default function CandidatesPage() {
  const router = useRouter();
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-250, 250], [-15, 15]);
  const interestedOpacity = useTransform(x, [30, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -30], [1, 0]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userId, setUserId] = useState("");
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function loadCandidates() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "recruiter") {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .neq("id", user.id)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setCandidates(data || []);

      setLoading(false);
    }

    loadCandidates();
  }, [router]);

  const filteredCandidates = candidates.filter((candidate) => {
    const query = search.toLowerCase();

    const matchesSearch =
      candidate.headline?.toLowerCase().includes(query) ||
      candidate.bio?.toLowerCase().includes(query) ||
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(query)
      );

    const matchesLocation = candidate.location
      ?.toLowerCase()
      .includes(location.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const currentCandidate = filteredCandidates[index];

  async function handleDecision(action: "interested" | "pass") {
    if (!currentCandidate || saving || exitDirection) return;

    setError("");
    setExitDirection(action === "interested" ? "right" : "left");
  }

  async function saveDecision() {
    if (!currentCandidate || !userId || saving) return;

    setSaving(true);

    const supabase = createClient();

    const { data: existing, error: lookupError } = await supabase
      .from("candidate_interests")
      .select("id")
      .eq("recruiter_id", userId)
      .eq("candidate_id", currentCandidate.id)
      .maybeSingle();

    if (lookupError) {
      setError(lookupError.message);
      resetCard();
      return;
    }

    const action = exitDirection === "right" ? "interested" : "pass";

    const result = existing
      ? await supabase
          .from("candidate_interests")
          .update({ action })
          .eq("id", existing.id)
      : await supabase.from("candidate_interests").insert({
          recruiter_id: userId,
          candidate_id: currentCandidate.id,
          action,
        });

    if (result.error) {
      setError(result.error.message);
      resetCard();
      return;
    }

    setIndex((previous) => previous + 1);
    resetCard();
  }

  function resetCard() {
    setSaving(false);
    setExitDirection(null);
    x.set(0);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 100) handleDecision("interested");
    else if (info.offset.x < -100) handleDecision("pass");
  }

  useEffect(() => {
    setIndex(0);
  }, [search, location]);

  return (
    <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b] md:p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
        <LogoutButton />
      </header>

      <section className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-3xl font-black">Discover Candidates</h2>
        <p className="mt-2 text-gray-500">
          Find the right people for your team.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            placeholder="Search skills or headline"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border bg-white p-3 text-gray-900"
          />

          <input
            placeholder="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border bg-white p-3 text-gray-900"
          />
        </div>

        {loading && <p className="mt-10 text-center">Loading candidates...</p>}

        {error && <p className="mt-6 text-center text-red-600">{error}</p>}

        {!loading && !currentCandidate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-3xl bg-white p-12 text-center shadow-lg"
          >
            <h3 className="text-2xl font-bold">You're all caught up! 🎉</h3>
            <p className="mt-3 text-gray-500">
              No more candidates match your current search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setLocation("");
              }}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {!loading && currentCandidate && (
          <>
            <p className="mt-6 text-center text-sm text-gray-500">
              Candidate {index + 1} of {filteredCandidates.length}
            </p>

            <motion.div
              key={currentCandidate.id}
              style={{ x, rotate, touchAction: "pan-y" }}
              drag={saving || exitDirection ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: 35, scale: 0.94 }}
              animate={
                exitDirection
                  ? {
                      x: exitDirection === "right" ? 1000 : -1000,
                      rotate: exitDirection === "right" ? 25 : -25,
                      opacity: 0,
                      scale: 0.8,
                    }
                  : { x: 0, rotate: 0, opacity: 1, y: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onAnimationComplete={() => {
                if (exitDirection && !saving) saveDecision();
              }}
              className="relative mt-4 cursor-grab rounded-3xl border border-gray-100 bg-white p-8 shadow-xl active:cursor-grabbing"
            >
              <motion.div
                style={{ opacity: interestedOpacity }}
                className="pointer-events-none absolute left-8 top-8 z-10 rotate-[-15deg] rounded-xl border-4 border-green-500 px-4 py-2 text-2xl font-black text-green-500"
              >
                INTERESTED ❤️
              </motion.div>

              <motion.div
                style={{ opacity: passOpacity }}
                className="pointer-events-none absolute right-8 top-8 z-10 rotate-[15deg] rounded-xl border-4 border-red-500 px-4 py-2 text-2xl font-black text-red-500"
              >
                PASS ✕
              </motion.div>

              <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                Candidate
              </span>

              <h3 className="mt-8 text-3xl font-black">
                {currentCandidate.headline}
              </h3>

              <p className="mt-2 text-gray-500">
                📍 {currentCandidate.location}
              </p>

              <p className="mt-6 leading-relaxed text-gray-600">
                {currentCandidate.bio || "No bio provided."}
              </p>

              <h4 className="mt-7 font-bold">Skills</h4>

              <div className="mt-3 flex flex-wrap gap-2">
                {currentCandidate.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-7 space-y-3 text-gray-700">
                <p>
                  <strong>Experience:</strong>{" "}
                  {currentCandidate.experience_years} years
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {currentCandidate.education || "Not provided"}
                </p>
              </div>
            </motion.div>

            <div className="mt-8 flex justify-center gap-10">
              <motion.button
                disabled={saving || !!exitDirection}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85, rotate: -12 }}
                onClick={() => handleDecision("pass")}
                className="h-16 w-16 rounded-full border-2 border-red-200 bg-white text-3xl text-red-500 shadow-md hover:bg-red-50"
              >
                ✕
              </motion.button>

              <motion.button
                disabled={saving || !!exitDirection}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85, rotate: 12 }}
                onClick={() => handleDecision("interested")}
                className="h-16 w-16 rounded-full border-2 border-green-200 bg-white text-3xl text-green-500 shadow-md hover:bg-green-50"
              >
                ♥
              </motion.button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-400">
              Swipe right to Interested · Swipe left to Pass
            </p>
          </>
        )}
      </section>
    </main>
  );
}