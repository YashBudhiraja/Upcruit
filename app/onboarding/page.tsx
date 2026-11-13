"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    skills: "",
    experience_years: "0",
    education: "",
    location: "",
    company_name: "",
    company_website: "",
    company_description: "",
    designation: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!data) {
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      setRole(data.role);
      setLoading(false);
    }

    loadProfile();
  }, []);

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    let result;

    if (role === "candidate") {
      result = await supabase.from("candidate_profiles").upsert({
        id: user.id,
        headline: form.headline,
        bio: form.bio,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        experience_years: Number(form.experience_years),
        education: form.education,
        location: form.location,
      });
    } else {
      result = await supabase.from("recruiter_profiles").upsert({
        id: user.id,
        company_name: form.company_name,
        company_website: form.company_website,
        company_description: form.company_description,
        designation: form.designation,
        location: form.location,
      });
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaff] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-5 rounded-3xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-3xl font-black text-[#17172b]">
          Complete Your Profile
        </h1>

        <p className="text-gray-500">
          Tell us a little about yourself.
        </p>

        {role === "candidate" ? (
          <>
            <input name="headline" placeholder="Professional headline"
              value={form.headline} onChange={updateField} required
              className="w-full rounded-xl border p-3 text-gray-900" />

            <textarea name="bio" placeholder="About yourself"
              value={form.bio} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />

            <input name="skills" placeholder="Skills (Python, SQL, Java)"
              value={form.skills} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />

            <input name="experience_years" type="number" min="0"
              placeholder="Experience in years"
              value={form.experience_years} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />

            <input name="education" placeholder="Education"
              value={form.education} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />
          </>
        ) : (
          <>
            <input name="company_name" placeholder="Company name"
              value={form.company_name} onChange={updateField} required
              className="w-full rounded-xl border p-3 text-gray-900" />

            <input name="designation" placeholder="Your designation"
              value={form.designation} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />

            <input name="company_website" placeholder="Company website"
              value={form.company_website} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />

            <textarea name="company_description"
              placeholder="About the company"
              value={form.company_description} onChange={updateField}
              className="w-full rounded-xl border p-3 text-gray-900" />
          </>
        )}

        <input name="location" placeholder="Your location"
          value={form.location} onChange={updateField} required
          className="w-full rounded-xl border p-3 text-gray-900" />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-violet-600 p-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </form>
    </main>
  );
}