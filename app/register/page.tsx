"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(
        "Account created! Please check your email to verify your account."
      );
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaff] px-5 py-12 text-[#17172b]">

      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-xl shadow-violet-100">

        <a href="/" className="text-3xl font-black tracking-tight text-[#17172b]">
          upcruit<span className="text-violet-600">.</span>
        </a>

        <h1 className="mt-8 text-3xl font-black text-[#17172b]">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Find opportunities. Discover talent. Make connections.
        </p>

        {/* ROLE SELECTION */}

        <div className="mt-8 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`rounded-xl border p-4 text-sm font-semibold transition ${
              role === "candidate"
                ? "border-violet-600 bg-violet-50 text-violet-700"
                : "border-gray-200 text-gray-500"
            }`}
          >
            👨‍💻 Candidate
          </button>

          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`rounded-xl border p-4 text-sm font-semibold transition ${
              role === "recruiter"
                ? "border-violet-600 bg-violet-50 text-violet-700"
                : "border-gray-200 text-gray-500"
            }`}
          >
            🏢 Recruiter
          </button>

        </div>

        {/* REGISTRATION FORM */}

        <form onSubmit={handleRegister} className="mt-7 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-4 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-violet-600">
            Log in
          </a>
        </p>

      </div>
    </main>
  );
}