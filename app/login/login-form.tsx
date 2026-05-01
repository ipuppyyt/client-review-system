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

const inputClass = `input input-bordered input-primary w-full`;

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

      <div className="form-control w-full">
        <label className="label" htmlFor="email">
          <span className="label-text">Email</span>
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
          <label className="label">
            <span className="label-text-alt text-error">{form.formState.errors.email.message}</span>
          </label>
        )}
      </div>

      <div className="form-control w-full">
        <label className="label" htmlFor="password">
          <span className="label-text">Password</span>
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
          <label className="label">
            <span className="label-text-alt text-error">{form.formState.errors.password.message}</span>
          </label>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
