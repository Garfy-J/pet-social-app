import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatIcon } from "@/components/ChatIcon";
import { NewPostFab } from "@/components/NewPostFab";
import { PawIcon } from "@/components/PawIcon";
import { createClient } from "@/utils/supabase/server";
import { addComment, toggleLike } from "./actions";

type Post = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  created_at: string;
  profiles: { username: string } | null;
  likes: { id: string; user_id: string }[];
  comments: {
    id: string;
    body: string;
    created_at: string;
    profiles: { username: string } | null;
  }[];
};

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, media_url, media_type, caption, created_at, profiles(username), likes(id, user_id), comments(id, body, created_at, profiles(username))",
    )
    .order("created_at", { ascending: false })
    .order("created_at", { ascending: false, referencedTable: "comments" })
    .returns<Post[]>();

  const recent = posts?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto min-h-screen max-w-xl bg-background pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PawIcon className="h-5 w-5" />
          </div>
          <h1 className="font-heading text-lg font-bold text-foreground">
            Pets Social
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            aria-label="Messages"
            className="text-secondary hover:text-secondary-dark"
          >
            <ChatIcon className="h-6 w-6" />
          </Link>
          <form action="/auth/sign-out" method="post">
            <button className="text-sm font-bold text-secondary hover:text-secondary-dark">
              Sign out
            </button>
          </form>
        </div>
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
            const liked = post.likes.some((like) => like.user_id === user.id);
            const latestComment = post.comments[0];
            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="card scroll-mt-20 overflow-hidden"
              >
                <div className="flex items-center gap-2 p-4 pb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
                    {post.profiles?.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {post.profiles?.username ?? "unknown"}
                  </span>
                </div>

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
                      <button
                        type="submit"
                        className={`flex items-center gap-1 font-bold transition-transform hover:scale-110 ${
                          liked ? "text-primary" : "text-foreground/40"
                        }`}
                      >
                        {liked ? "♥" : "♡"} {post.likes.length}
                      </button>
                    </form>
                    <span className="flex items-center gap-1 font-bold text-foreground/40">
                      💬 {post.comments.length}
                    </span>
                  </div>

                  {latestComment && (
                    <p className="mt-3 text-sm">
                      <span className="font-bold text-secondary-dark">
                        {latestComment.profiles?.username ?? "unknown"}
                      </span>{" "}
                      <span className="text-foreground/80">{latestComment.body}</span>
                    </p>
                  )}

                  <form
                    action={addComment.bind(null, post.id)}
                    className="mt-3 flex gap-2"
                  >
                    <input
                      type="text"
                      name="body"
                      placeholder="Add a comment..."
                      required
                      className="input-field flex-1 py-1.5"
                    />
                    <button
                      type="submit"
                      className="btn-primary px-4 py-1.5 text-xs"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        ) : (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <PawIcon className="h-16 w-16 text-primary/25" />
            <p className="font-heading text-lg font-bold text-foreground">
              No paw-some posts yet
            </p>
            <p className="text-sm text-foreground/60">
              Be the first to share a pic of your pet!
            </p>
          </div>
        )}
      </main>

      <NewPostFab />
    </div>
  );
}
