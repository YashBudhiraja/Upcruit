"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: string;
  name: string;
};

export default function MessagesPage() {
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error(profileError);
        return;
      }

      const isCandidate = profile.role === "candidate";
      const matchColumn = isCandidate ? "candidate_id" : "recruiter_id";
      const personColumn = isCandidate ? "recruiter_id" : "candidate_id";

      const { data: matches, error: matchError } = await supabase
        .from("matches")
        .select("id, candidate_id, recruiter_id")
        .eq(matchColumn, user.id)
        .order("created_at", { ascending: false });

      if (matchError) {
        console.error(matchError);
        return;
      }

      if (!matches || matches.length === 0) {
        setConversations([]);
        return;
      }

      const personIds = matches.map(
        (match) => match[personColumn as "candidate_id" | "recruiter_id"]
      );

      const { data: people, error: peopleError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", personIds);

      if (peopleError) {
        console.error(peopleError);
        return;
      }

      const results = matches.map((match) => {
        const personId = match[
          personColumn as "candidate_id" | "recruiter_id"
        ];

        const person = people?.find((p) => p.id === personId);

        return {
          id: match.id,
          name: person?.full_name || "Matched User",
        };
      });

      setConversations(results);
    } catch (error) {
      console.error("Conversation loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Messages 💬
        </h1>

        <p className="mt-2 text-gray-500">
          Your conversations with matched users.
        </p>

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-gray-500">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-lg font-semibold text-gray-800">
                No conversations yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Once you match with someone, you can start messaging here.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {conversation.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Open conversation
                    </p>
                  </div>

                  <span className="text-xl">💬</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}