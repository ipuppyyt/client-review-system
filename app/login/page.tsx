import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "Login | ReviewHub",
  description: "Sign in to manage your client reviews.",
};

export default function LoginPage() {
  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content w-full max-w-md">
        <div className="card w-full bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body p-8">
            <div className="mb-8 text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="text-2xl font-bold">R</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-base-content/70 text-sm">
                Sign in to access your dashboard
              </p>
            </div>
            <Suspense fallback={<div className="text-center text-sm text-base-content/70">Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
