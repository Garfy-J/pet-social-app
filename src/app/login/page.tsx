import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { PawBackground } from "@/components/PawBackground";
import { PawIcon } from "@/components/PawIcon";
import { login, signup } from "./actions";

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

        {searchParams.error && (
          <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary-dark">
            {searchParams.error}
          </p>
        )}
        {searchParams.message && (
          <p className="rounded-xl bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary-dark">
            {searchParams.message}
          </p>
        )}

        <GoogleSignInButton />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-foreground/40">
          <div className="h-px flex-1 bg-black/10" />
          or use email
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-foreground">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input-field mt-1"
              placeholder="only needed for sign up"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="input-field mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button formAction={login} className="btn-primary flex-1">
              Log in
            </button>
            <button formAction={signup} className="btn-outline flex-1">
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
