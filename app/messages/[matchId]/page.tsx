"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    async function initializeChat() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Message loading error:", error);
      } else {
        setMessages(data || []);
      }

      channel = supabase
        .channel(`chat-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;

            setMessages((previous) => {
              if (previous.some((message) => message.id === newMessage.id)) {
                return previous;
              }

              return [...previous, newMessage];
            });
          }
        )
        .subscribe();

      setLoading(false);
    }

    initializeChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    const messageContent = content.trim();

    if (!messageContent || !userId || sending) return;

    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        match_id: matchId,
        sender_id: userId,
        content: messageContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Message sending error:", error);
      alert(error.message);
    } else if (data) {
      setMessages((previous) => {
        if (previous.some((message) => message.id === data.id)) {
          return previous;
        }

        return [...previous, data];
      });

      setContent("");
    }

    setSending(false);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f9fc]">
      <header className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/messages"
            className="text-xl text-gray-500 hover:text-indigo-600"
          >
            ←
          </Link>

          <div>
            <h1 className="font-bold text-gray-900">Chat 💬</h1>
            <p className="text-xs text-green-600">Matched connection</p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-5">
        <div className="flex-1 space-y-4 overflow-y-auto py-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl">👋</div>
              <h2 className="mt-4 font-semibold text-gray-800">
                It's a match!
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Say hello and start your conversation.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === userId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "rounded-br-sm bg-indigo-600 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    <p className="break-words text-sm">{message.content}</p>

                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isMine ? "text-indigo-200" : "text-gray-400"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={sendMessage}
          className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-[#f8f9fc] py-4"
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            maxLength={5000}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}