import Image from "next/image";
import Link from "next/link";
import { AuthGateProvider } from "@/components/AuthGate";
import { Avatar } from "@/components/Avatar";
import { ChatIcon } from "@/components/ChatIcon";
import { CommentForm } from "@/components/CommentForm";
import { DeleteButton } from "@/components/DeleteButton";
import { LikeButton } from "@/components/LikeButton";
import { NewPostFab } from "@/components/NewPostFab";
import { PawBackground } from "@/components/PawBackground";
import { PawIcon } from "@/components/PawIcon";
import { ProfileLink } from "@/components/ProfileLink";
import { ReportButton } from "@/components/ReportButton";
import { createClient } from "@/utils/supabase/server";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import {
  addComment,
  deleteComment,
  deletePost,
  reportComment,
  reportPost,
  toggleLike,
} from "./actions";

type Profile = { username: string; avatar_url: string | null };

type Post = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  created_at: string;
  profiles: Profile | null;
  likes: { id: string; user_id: string }[];
  comments: {
    id: string;
    user_id: string;
    body: string;
    created_at: string;
    profiles: Profile | null;
  }[];
};

export const dynamic = "force-dynamic";

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFE4D9] to-[#FFFBF7] px-8 py-16 text-center mb-8">
      <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-[#FFC94A] opacity-20" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-[#1B8A87] opacity-15" />
      <div className="relative">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Every pet has a story</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Share photos, videos, and memes of your furry (or feathery, or scaly) friends
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  const { data: myProfile, error: myProfileError } = user
    ? await supabase
        .from("profiles")
        .select("username, avatar_url, is_admin")
        .eq("id", user.id)
        .single()
    : { data: null, error: null };

  const isAdmin = myProfile?.is_admin ?? false;

  console.log("[HomePage debug]", {
    userId: user?.id,
    userEmail: user?.email,
    myProfile,
    myProfileError,
    isAdmin,
  });

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, user_id, media_url, media_type, caption, created_at, profiles(username, avatar_url), likes(id, user_id), comments(id, user_id, body, created_at, profiles(username, avatar_url))",
    )
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: false, referencedTable: "comments" })
    .returns<Post[]>();

  const recent = posts?.slice(0, 5) ?? [];

  return (
    <AuthGateProvider>
      <div className="mx-auto min-h-screen max-w-xl bg-background pb-24">
        <Hero />
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-background/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PawIcon className="h-5 w-5" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">
              Pets Social
            </span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                aria-label="Messages"
                className="text-secondary hover:text-secondary-dark"
              >
                <ChatIcon className="h-6 w-6" />
              </Link>
              {myProfile && (
                <Link href={`/profile/${myProfile.username}`} aria-label="Your profile">
                  <Avatar username={myProfile.username} avatarUrl={myProfile.avatar_url} />
                </Link>
              )}
              <form action="/auth/sign-out" method="post">
                <button className="text-sm font-bold text-secondary hover:text-secondary-dark">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-bold text-secondary hover:text-secondary-dark">
                Log in
              </Link>
              <Link href="/login" className="btn-primary px-4 py-2 text-xs">
                Sign up
              </Link>
            </div>
          )}
        </header>

        {recent.length > 0 && (
          <section className="px-4 pt-4">
            <h2 className="mb-2 font-heading text-sm font-bold text-foreground/70">
              Recently shared
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recent.map((post) => (
                <a
                  key={post.id}
                  href={`#post-${post.id}`}
                  className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl bg-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-transform hover:scale-105"
                >
                  {post.media_type === "video" ? (
                    <video src={post.media_url} className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src={post.media_url}
                      alt={post.caption ?? "Pet post"}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        <main className="mt-2 space-y-4 px-4">
          {posts?.length ? (
            posts.map((post) => {
              const liked = post.likes.some((like) => like.user_id === user?.id);
              const latestComment = post.comments[0];
              return (
                <article
                  key={post.id}
                  id={`post-${post.id}`}
                  className="card scroll-mt-20 overflow-hidden"
                >
                  <ProfileLink
                    isLoggedIn={isLoggedIn}
                    username={post.profiles?.username}
                    className="flex items-center gap-2 p-4 pb-3 hover:opacity-80"
                  >
                    <Avatar
                      username={post.profiles?.username ?? "?"}
                      avatarUrl={post.profiles?.avatar_url}
                    />
                    <span className="text-sm font-bold text-foreground">
                      {post.profiles?.username ?? "unknown"}
                    </span>
                    <span className="text-xs font-medium text-foreground/40">
                      · {formatRelativeTime(post.created_at)}
                    </span>
                  </ProfileLink>

                  <div className="bg-black/5">
                    {post.media_type === "video" ? (
                      <video
                        src={post.media_url}
                        controls
                        className="max-h-[480px] w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={post.media_url}
                        alt={post.caption ?? "Pet post"}
                        width={800}
                        height={800}
                        className="max-h-[480px] w-full object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  <div className="p-4">
                    {post.caption && (
                      <p className="text-sm text-foreground/90">{post.caption}</p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <form action={toggleLike.bind(null, post.id)}>
                        <LikeButton liked={liked} count={post.likes.length} isLoggedIn={isLoggedIn} />
                      </form>
                      <span className="flex items-center gap-1 font-bold text-foreground/40">
                        💬 {post.comments.length}
                      </span>
                      <span className="ml-auto flex items-center gap-3">
                        {(post.user_id === user?.id || isAdmin) && (
                          <form action={deletePost.bind(null, post.id, post.media_url)}>
                            <DeleteButton />
                          </form>
                        )}
                        {post.user_id !== user?.id && (
                          <form action={reportPost.bind(null, post.id)}>
                            <ReportButton isLoggedIn={isLoggedIn} />
                          </form>
                        )}
                      </span>
                    </div>

                    {latestComment && (
                      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm">
                        <span>
                          <ProfileLink
                            isLoggedIn={isLoggedIn}
                            username={latestComment.profiles?.username}
                            className="font-bold text-secondary-dark hover:underline"
                          >
                            {latestComment.profiles?.username ?? "unknown"}
                          </ProfileLink>{" "}
                          <span className="text-foreground/80">{latestComment.body}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          {(latestComment.user_id === user?.id || isAdmin) && (
                            <form action={deleteComment.bind(null, latestComment.id)}>
                              <DeleteButton />
                            </form>
                          )}
                          {latestComment.user_id !== user?.id && (
                            <form action={reportComment.bind(null, latestComment.id)}>
                              <ReportButton isLoggedIn={isLoggedIn} />
                            </form>
                          )}
                        </span>
                      </p>
                    )}

                    <CommentForm isLoggedIn={isLoggedIn} action={addComment.bind(null, post.id)} />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="card relative flex flex-col items-center gap-3 overflow-hidden p-12 text-center">
              <PawBackground variant="compact" />
              <PawIcon className="relative h-16 w-16 text-primary/25" />
              <p className="relative font-heading text-lg font-bold text-foreground">
                No paw-some posts yet
              </p>
              <p className="relative text-sm text-foreground/60">
                Be the first to share a pic of your pet!
              </p>
            </div>
          )}
        </main>

        <NewPostFab isLoggedIn={isLoggedIn} />
      </div>
    </AuthGateProvider>
  );
}
