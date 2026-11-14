"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";

type Job = {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  skills_required: string[];
};

export default function JobsPage() {
  const router = useRouter();
  const x = useMotionValue(0);

  const rotate = useTransform(x, [-250, 250], [-15, 15]);
  const interestedOpacity = useTransform(x, [30, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, -30], [1, 0]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState("");
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [employment, setEmployment] = useState("all");

  const processing = useRef(false);

  useEffect(() => {
    async function loadJobs() {
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

      if (profile?.role !== "candidate") {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setJobs(data || []);

      setLoading(false);
    }

    loadJobs();
  }, [router]);

  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase();

    const matchesSearch =
      job.title?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.skills_required?.some((skill) =>
        skill.toLowerCase().includes(query)
      );

    const matchesLocation = job.location
      ?.toLowerCase()
      .includes(location.toLowerCase());

    const matchesEmployment =
      employment === "all" || job.employment_type === employment;

    return matchesSearch && matchesLocation && matchesEmployment;
  });

  const currentJob = filteredJobs[index];

  async function handleDecision(action: "interested" | "pass") {
    if (!currentJob || saving || exitDirection) return;

    setError("");
    setExitDirection(action === "interested" ? "right" : "left");
  }

  async function saveDecision() {
    if (!currentJob || !userId || processing.current) return;

    processing.current = true;
    setSaving(true);

    const supabase = createClient();

    const { data: existing, error: lookupError } = await supabase
      .from("interests")
      .select("id")
      .eq("candidate_id", userId)
      .eq("job_id", currentJob.id)
      .maybeSingle();

    if (lookupError) {
      setError(lookupError.message);
      resetCard();
      return;
    }

    const action = exitDirection === "right" ? "interested" : "pass";

    const result = existing
      ? await supabase
          .from("interests")
          .update({ action })
          .eq("id", existing.id)
      : await supabase.from("interests").insert({
          candidate_id: userId,
          job_id: currentJob.id,
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
    processing.current = false;
    setSaving(false);
    setExitDirection(null);
    x.set(0);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 100) {
      handleDecision("interested");
    } else if (info.offset.x < -100) {
      handleDecision("pass");
    }
  }

  useEffect(() => {
    setIndex(0);
  }, [search, location, employment]);

  return (
    <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b] md:p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
        <LogoutButton />
      </header>

      <section className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-3xl font-black">Discover Opportunities</h2>
        <p className="mt-2 text-gray-500">
          Swipe your way towards your next opportunity.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            placeholder="Search jobs or skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border bg-white p-3 text-gray-900"
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border bg-white p-3 text-gray-900"
          />

          <select
            value={employment}
            onChange={(e) => setEmployment(e.target.value)}
            className="rounded-xl border bg-white p-3 text-gray-900"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        {loading && (
          <p className="mt-10 text-center">Loading jobs...</p>
        )}

        {error && (
          <p className="mt-6 text-center text-red-600">{error}</p>
        )}

        {!loading && !currentJob && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-3xl bg-white p-12 text-center shadow-lg"
          >
            <h3 className="text-2xl font-bold">You're all caught up! 🎉</h3>
            <p className="mt-3 text-gray-500">
              No more jobs match your current search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setLocation("");
                setEmployment("all");
              }}
              className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {!loading && currentJob && (
          <>
            <p className="mt-6 text-center text-sm text-gray-500">
              Job {index + 1} of {filteredJobs.length}
            </p>

            <motion.div
              key={currentJob.id}
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
                if (exitDirection && !processing.current) {
                  saveDecision();
                }
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

              <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold capitalize text-violet-700">
                {currentJob.employment_type}
              </span>

              <h3 className="mt-8 text-3xl font-black">
                {currentJob.title}
              </h3>

              <p className="mt-2 text-gray-500">
                📍 {currentJob.location}
              </p>

              <p className="mt-6 leading-relaxed text-gray-600">
                {currentJob.description}
              </p>

              <h4 className="mt-7 font-bold">Required Skills</h4>

              <div className="mt-3 flex flex-wrap gap-2">
                {currentJob.skills_required?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="mt-7 font-semibold text-gray-700">
                Salary:{" "}
                {currentJob.salary_min || currentJob.salary_max
                  ? `${currentJob.salary_min ?? "—"} - ${currentJob.salary_max ?? "—"}`
                  : "Not disclosed"}
              </p>
            </motion.div>

            <div className="mt-8 flex justify-center gap-10">
              <motion.button
                disabled={saving || !!exitDirection}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85, rotate: -12 }}
                onClick={() => handleDecision("pass")}
                className="h-16 w-16 rounded-full border-2 border-red-200 bg-white text-3xl text-red-500 shadow-md hover:bg-red-50 disabled:opacity-50"
              >
                ✕
              </motion.button>

              <motion.button
                disabled={saving || !!exitDirection}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.85, rotate: 12 }}
                onClick={() => handleDecision("interested")}
                className="h-16 w-16 rounded-full border-2 border-green-200 bg-white text-3xl text-green-500 shadow-md hover:bg-green-50 disabled:opacity-50"
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