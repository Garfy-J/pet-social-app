"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ChatRoom({
  conversationId,
  currentUserId,
  isUserA,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  isUserA: boolean;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // Postgres Changes enforces RLS using the Realtime socket's auth
      // token — it must be set before subscribing, or a freshly created
      // client joins as anon and every event gets silently filtered out.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const incoming = payload.new as Message;
            setMessages((prev) =>
              prev.some((message) => message.id === incoming.id)
                ? prev
                : [...prev, incoming],
            );
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const now = new Date().toISOString();
    const update = isUserA
      ? { user_a_last_read_at: now }
      : { user_b_last_read_at: now };
    supabaseRef.current
      .from("conversations")
      .update(update)
      .eq("id", conversationId)
      .then();
  }, [messages, conversationId, isUserA]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content) return;

    setSending(true);
    setError(null);
    setInput("");

    const { error: sendError } = await supabaseRef.current
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      });

    if (sendError) {
      setError("Message failed to send — please try again.");
      setInput(content);
    }
    setSending(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.05)] ${
                  mine
                    ? "bg-primary text-white"
                    : "border border-black/5 bg-white text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 pb-1 text-xs font-semibold text-primary-dark">{error}</p>
      )}

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-black/5 bg-background p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message..."
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary px-5"
        >
          Send
        </button>
      </form>
    </div>
  );
}
