"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type PostFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { status: "error", message: "Your session expired — please sign in again." };
    }

    const file = formData.get("media") as File | null;
    const caption = (formData.get("caption") as string | null)?.trim() || null;

    if (!file || file.size === 0) {
      return { status: "error", message: "Please choose an image or video to upload." };
    }

    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const extension = file.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(path, file);
    if (uploadError) {
      return { status: "error", message: `Upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-media").getPublicUrl(path);

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      media_url: publicUrl,
      media_type: mediaType,
      caption,
    });
    if (error) {
      return { status: "error", message: `Couldn't save your post: ${error.message}` };
    }

    revalidatePath("/");
    return { status: "success" };
  } catch (err) {
    console.error("createPost failed", err);
    return { status: "error", message: "Something went wrong — please try again." };
  }
}

export async function toggleLike(postId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
}

export async function addComment(postId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = (formData.get("body") as string | null)?.trim();
  if (!body) return;

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export type ProfileFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { status: "error", message: "Your session expired — please sign in again." };
    }

    const bio = (formData.get("bio") as string | null)?.trim() || null;
    const avatarFile = formData.get("avatar") as File | null;

    let avatarUrl: string | undefined;
    if (avatarFile && avatarFile.size > 0) {
      const extension = avatarFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        return { status: "error", message: `Avatar upload failed: ${uploadError.message}` };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = `${publicUrl}?v=${Date.now()}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ bio, ...(avatarUrl ? { avatar_url: avatarUrl } : {}) })
      .eq("id", user.id);
    if (error) {
      return { status: "error", message: `Couldn't update your profile: ${error.message}` };
    }

    const username = formData.get("username") as string | null;
    revalidatePath("/");
    if (username) revalidatePath(`/profile/${username}`);
    return { status: "success" };
  } catch (err) {
    console.error("updateProfile failed", err);
    return { status: "error", message: "Something went wrong — please try again." };
  }
}

export async function deletePost(postId: string, mediaUrl: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);

  const marker = "/object/public/post-media/";
  const markerIndex = mediaUrl.indexOf(marker);
  if (markerIndex !== -1) {
    const path = mediaUrl.slice(markerIndex + marker.length);
    await supabase.storage.from("post-media").remove([path]);
  }

  revalidatePath("/");
}

export async function deleteComment(commentId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function reportPost(postId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: user.id, post_id: postId });
  if (error) throw new Error(error.message);
}

export async function reportComment(commentId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: user.id, comment_id: commentId });
  if (error) throw new Error(error.message);
}

export async function findOrCreateConversation(otherUserId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === otherUserId) redirect("/");

  const [userA, userB] = [user.id, otherUserId].sort();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  if (existing) redirect(`/chat/${existing.id}`);

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_a: userA, user_b: userB })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  redirect(`/chat/${created.id}`);
}
