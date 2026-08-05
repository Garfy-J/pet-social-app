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
