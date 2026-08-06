import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { findOrCreateConversation } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { EditProfileForm } from "@/components/EditProfileForm";
import { PawBackground } from "@/components/PawBackground";
import { PawIcon } from "@/components/PawIcon";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, media_url, media_type, caption, likes(id), comments(id)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const isOwnProfile = user.id === profile.id;

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
          {profile.username}
        </h1>
      </header>

      <section className="card relative m-4 flex flex-col items-center gap-3 overflow-hidden p-6 text-center">
        <PawBackground variant="compact" />
        <div className="relative">
          <Avatar username={profile.username} avatarUrl={profile.avatar_url} size="lg" />
        </div>
        <p className="relative font-heading text-xl font-bold text-foreground">
          {profile.username}
        </p>
        {profile.bio && (
          <p className="relative max-w-xs text-sm text-foreground/70">{profile.bio}</p>
        )}

        {isOwnProfile ? (
          <div className="relative">
            <EditProfileForm username={profile.username} bio={profile.bio} />
          </div>
        ) : (
          <form action={findOrCreateConversation.bind(null, profile.id)} className="relative">
            <button type="submit" className="btn-primary">
              Message
            </button>
          </form>
        )}
      </section>

      <main className="px-4">
        {posts?.length ? (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/#post-${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-black/5 transition-transform hover:scale-[1.02]"
              >
                {post.media_type === "video" ? (
                  <video src={post.media_url} className="h-full w-full object-cover" />
                ) : (
                  <Image
                    src={post.media_url}
                    alt={post.caption ?? "Pet post"}
                    width={200}
                    height={200}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-xs font-bold text-white">
                  <span>♥ {post.likes.length}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card relative flex flex-col items-center gap-3 overflow-hidden p-12 text-center">
            <PawBackground variant="compact" />
            <PawIcon className="relative h-16 w-16 text-primary/25" />
            <p className="relative font-heading text-lg font-bold text-foreground">
              No posts yet
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
