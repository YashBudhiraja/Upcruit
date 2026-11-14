"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateJobPage() {
  const supabase = createClient();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    employment_type: "full-time",
    salary_min: "",
    salary_max: "",
    skills_required: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

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
      setError("Only recruiters can post jobs.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("jobs")
      .insert({
        recruiter_id: user.id,
        title: form.title,
        description: form.description,
        location: form.location,
        employment_type: form.employment_type,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        skills_required: form.skills_required
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        status: "open",
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/jobs/manage");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#fafaff] p-6 text-[#17172b]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 max-w-2xl space-y-5 rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-3xl font-black">Post a Job</h1>
        <p className="text-gray-500">
          Find the right talent for your team.
        </p>

        <input
          name="title"
          placeholder="Job title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-xl border p-3 text-gray-900"
        />

        <textarea
          name="description"
          placeholder="Job description and responsibilities"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-xl border p-3 text-gray-900"
        />

        <input
          name="location"
          placeholder="Job location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full rounded-xl border p-3 text-gray-900"
        />

        <select
          name="employment_type"
          value={form.employment_type}
          onChange={handleChange}
          className="w-full rounded-xl border p-3 text-gray-900"
        >
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="salary_min"
            type="number"
            min="0"
            placeholder="Minimum salary"
            value={form.salary_min}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-gray-900"
          />

          <input
            name="salary_max"
            type="number"
            min="0"
            placeholder="Maximum salary"
            value={form.salary_max}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 text-gray-900"
          />
        </div>

        <input
          name="skills_required"
          placeholder="Required skills (Python, SQL, React)"
          value={form.skills_required}
          onChange={handleChange}
          className="w-full rounded-xl border p-3 text-gray-900"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-violet-600 p-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? "Publishing..." : "Publish Job"}
        </button>
      </form>
    </main>
  );
}