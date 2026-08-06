import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { PawBackground } from "@/components/PawBackground";
import { PawIcon } from "@/components/PawIcon";
import { createClient } from "@/utils/supabase/server";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

type Profile = { username: string; avatar_url: string | null };

type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  user_a_last_read_at: string | null;
  user_b_last_read_at: string | null;
  user_a_profile: Profile | null;
  user_b_profile: Profile | null;
  messages: { content: string; created_at: string }[];
};

export default async function ChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, user_a, user_b, last_message_at, user_a_last_read_at, user_b_last_read_at, user_a_profile:profiles!conversations_user_a_fkey(username, avatar_url), user_b_profile:profiles!conversations_user_b_fkey(username, avatar_url), messages(content, created_at)",
    )
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
    .order("created_at", { ascending: false, referencedTable: "messages" })
    .limit(1, { referencedTable: "messages" })
    .returns<ConversationRow[]>();

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-background pb-16">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-background/90 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          aria-label="Back to feed"
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-foreground/60 hover:bg-black/5 hover:text-foreground"
        >
          ←
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">
          Messages
        </h1>
      </header>

      <main className="px-4 pt-4">
        {conversations?.length ? (
          <ul className="card divide-y divide-black/5">
            {conversations.map((conversation) => {
              const isUserA = conversation.user_a === user.id;
              const otherProfile = isUserA
                ? conversation.user_b_profile
                : conversation.user_a_profile;
              const lastMessage = conversation.messages[0];
              const myLastReadAt = isUserA
                ? conversation.user_a_last_read_at
                : conversation.user_b_last_read_at;
              const unread =
                !!lastMessage &&
                (!myLastReadAt ||
                  new Date(conversation.last_message_at) > new Date(myLastReadAt));

              return (
                <li key={conversation.id}>
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02]"
                  >
                    <Avatar
                      username={otherProfile?.username ?? "?"}
                      avatarUrl={otherProfile?.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm text-foreground ${unread ? "font-extrabold" : "font-bold"}`}
                      >
                        {otherProfile?.username ?? "Unknown"}
                      </p>
                      <p
                        className={`truncate text-xs ${unread ? "font-bold text-foreground/80" : "text-foreground/50"}`}
                      >
                        {lastMessage?.content ?? "Say hi 👋"}
                      </p>
                    </div>
                    <div className="flex flex-none flex-col items-end gap-1.5">
                      <span className="text-xs text-foreground/40">
                        {formatRelativeTime(conversation.last_message_at)}
                      </span>
                      {unread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card relative flex flex-col items-center gap-3 overflow-hidden p-12 text-center">
            <PawBackground variant="compact" />
            <PawIcon className="relative h-16 w-16 text-primary/25" />
            <p className="relative font-heading text-lg font-bold text-foreground">
              No conversations yet
            </p>
            <p className="relative text-sm text-foreground/60">
              Visit a profile and tap Message to start chatting.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
