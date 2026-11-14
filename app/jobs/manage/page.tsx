"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";

export default function ManageJobsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadJobs() {
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

    if (profile?.role !== "recruiter") {
      router.replace("/dashboard");
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setJobs(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function toggleJob(job: any) {
    const newStatus = job.status === "open" ? "closed" : "open";

    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id);

    if (error) {
      setError(error.message);
      return;
    }

    setJobs((current) =>
      current.map((item) =>
        item.id === job.id ? { ...item, status: newStatus } : item
      )
    );
  }

  async function deleteJob(id: string) {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setJobs((current) => current.filter((job) => job.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#fafaff] p-8 text-[#17172b]">
      <header className="flex justify-between">
        <h1 className="text-2xl font-black text-violet-700">Upcruit</h1>
        <LogoutButton />
      </header>

      <section className="mx-auto mt-12 max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black">Manage Jobs</h2>

          <button
            onClick={() => router.push("/jobs/create")}
            className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
          >
            + Post a Job
          </button>
        </div>

        {loading && <p className="mt-8">Loading jobs...</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p className="mt-8 text-gray-500">No jobs posted yet.</p>
        )}

        <div className="mt-8 space-y-5">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="text-xl font-bold">{job.title}</h3>
              <p className="mt-2 text-gray-500">{job.location}</p>

              <p className="mt-2 text-sm capitalize text-violet-600">
                {job.employment_type} · {job.status}
              </p>

              <p className="mt-3 text-gray-600">{job.description}</p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => toggleJob(job)}
                  className="rounded-lg bg-violet-100 px-4 py-2 font-semibold text-violet-700"
                >
                  {job.status === "open" ? "Close Job" : "Reopen Job"}
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}