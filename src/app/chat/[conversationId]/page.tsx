import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { ChatRoom } from "@/components/ChatRoom";
import { createClient } from "@/utils/supabase/server";

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", params.conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.user_a !== user.id && conversation.user_b !== user.id)
  ) {
    redirect("/chat");
  }

  const isUserA = conversation.user_a === user.id;
  const otherUserId = isUserA ? conversation.user_b : conversation.user_a;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", otherUserId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="mx-auto flex h-screen max-w-xl flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-background/90 px-4 py-3 backdrop-blur">
        <Link
          href="/chat"
          aria-label="Back to messages"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl text-foreground/60 hover:bg-black/5 hover:text-foreground"
        >
          ←
        </Link>
        <Avatar
          username={otherProfile?.username ?? "?"}
          avatarUrl={otherProfile?.avatar_url}
        />
        <Link
          href={`/profile/${otherProfile?.username ?? ""}`}
          className="font-heading text-lg font-bold text-foreground hover:underline"
        >
          {otherProfile?.username ?? "Unknown"}
        </Link>
      </header>

      <ChatRoom
        conversationId={conversation.id}
        currentUserId={user.id}
        isUserA={isUserA}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
