import Image from "next/image";

const SIZE_CLASSES = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-2xl",
} as const;

export function Avatar({
  username,
  avatarUrl,
  size = "sm",
}: {
  username: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={username}
        width={80}
        height={80}
        unoptimized
        className={`flex-none rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <div
      className={`flex flex-none items-center justify-center rounded-full bg-secondary font-bold text-white ${sizeClass}`}
    >
      {username[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
