import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "Login | ReviewHub",
  description: "Sign in to manage your client reviews.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-8">
        {/* Logo / Brand */}
        <div className="mb-8 text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl mb-3">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">R</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to access your dashboard
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
