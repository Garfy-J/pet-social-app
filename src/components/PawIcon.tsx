export function PawIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="42" rx="16" ry="13" />
      <ellipse cx="12" cy="24" rx="7" ry="9" transform="rotate(-20 12 24)" />
      <ellipse cx="52" cy="24" rx="7" ry="9" transform="rotate(20 52 24)" />
      <ellipse cx="22" cy="10" rx="6" ry="8" transform="rotate(-8 22 10)" />
      <ellipse cx="42" cy="10" rx="6" ry="8" transform="rotate(8 42 10)" />
    </svg>
  );
}
