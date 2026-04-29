"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/alert";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const inputClass = `flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700
  bg-white dark:bg-gray-800 px-3 py-2 text-sm
  text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
  disabled:cursor-not-allowed disabled:opacity-50 transition-colors`;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
          Email
        </label>
        <input
          {...form.register("email")}
          id="email"
          type="email"
          placeholder="name@example.com"
          className={inputClass}
          disabled={isLoading}
          autoComplete="email"
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-500 dark:text-red-400">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
          Password
        </label>
        <input
          {...form.register("password")}
          id="password"
          type="password"
          placeholder="••••••••"
          className={inputClass}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-500 dark:text-red-400">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg text-sm font-medium
            bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 py-2
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            disabled:pointer-events-none disabled:opacity-50 transition-colors"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
