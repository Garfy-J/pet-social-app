import { AuthForm } from "@/components/AuthForm";
import { PawBackground } from "@/components/PawBackground";
import { PawIcon } from "@/components/PawIcon";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <PawBackground />
      <div className="card relative w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PawIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-3 text-2xl font-heading font-bold text-foreground">
            Pets Social
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            Sign in or create an account
          </p>
        </div>

        <AuthForm error={searchParams.error} message={searchParams.message} />
      </div>
    </div>
  );
}
