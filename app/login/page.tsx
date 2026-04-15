import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "Login | Client Review System",
  description: "Sign in to manage your client reviews.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your credentials to access your dashboard
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
