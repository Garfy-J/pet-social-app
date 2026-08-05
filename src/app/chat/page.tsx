import Link from "next/link";
import { redirect } from "next/navigation";
import { PawIcon } from "@/components/PawIcon";
import { createClient } from "@/utils/supabase/server";

export default async function ChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .neq("id", user.id)
    .order("username")
    .limit(20);

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

      <div className="m-4 rounded-2xl bg-accent/20 px-4 py-3 text-sm font-semibold text-foreground/80">
        🚧 Messaging is coming soon — this is a preview of who you&apos;ll be
        able to chat with.
      </div>

      <main className="px-4">
        {profiles?.length ? (
          <ul className="card divide-y divide-black/5">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex cursor-not-allowed items-center gap-3 px-4 py-3 opacity-80"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                  {profile.username[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {profile.username}
                  </p>
                  <p className="text-xs text-foreground/50">
                    Say hi once messaging launches 👋
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <PawIcon className="h-16 w-16 text-primary/25" />
            <p className="font-heading text-lg font-bold text-foreground">
              No one else here yet
            </p>
            <p className="text-sm text-foreground/60">
              Invite fellow pet parents to start chatting soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
