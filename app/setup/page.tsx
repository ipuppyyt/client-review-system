"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, User, Palette } from "lucide-react";
import { Alert } from "@/components/alert";

const setupSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      password: "",
      orgName: "",
      logoUrl: "",
    },
  });

  const slugPreview = form.watch("orgName")
    ? form.watch("orgName").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    : "your-org";

  async function onSubmit(data: SetupFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Setup failed");
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Welcome</h1>
              <p className="text-sm text-base-content/70 mt-2">Set up your organization and start collecting reviews.</p>
            </div>

            {error && (
              <div className="alert alert-error mb-6">
                <div className="flex-1">
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-semibold">Admin Account</h2>
                </div>

                <div className="form-control w-full">
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    {...form.register("email")}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="input input-bordered input-primary w-full"
                    disabled={isLoading}
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
                    placeholder="At least 8 characters"
                    className="input input-bordered input-primary w-full"
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">{form.formState.errors.password.message}</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="divider">Organization</div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-semibold">Organization</h2>
                </div>

                <div className="form-control w-full">
                  <label className="label" htmlFor="orgName">
                    <span className="label-text">Organization Name</span>
                  </label>
                  <input
                    {...form.register("orgName")}
                    id="orgName"
                    type="text"
                    placeholder="Acme Inc"
                    className="input input-bordered input-primary w-full"
                    disabled={isLoading}
                  />
                  {form.formState.errors.orgName && (
                    <label className="label">
                      <span className="label-text-alt text-error">{form.formState.errors.orgName.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Organization Slug</span>
                  </label>
                  <div className="input input-bordered bg-base-200 text-base-content w-full">
                    <span className="text-base-content/70">/r/</span>
                    <span className="font-mono ml-2">{slugPreview}</span>
                  </div>
                  <p className="text-sm text-base-content/60 mt-2">This will be your public review URL.</p>
                </div>
              </div>

              <div className="divider">Branding</div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-semibold">Logo</h2>
                </div>

                <div className="form-control w-full">
                  <label className="label" htmlFor="logoUrl">
                    <span className="label-text">Logo URL (optional)</span>
                  </label>
                  <input
                    {...form.register("logoUrl")}
                    id="logoUrl"
                    type="text"
                    placeholder="https://example.com/logo.png"
                    className="input input-bordered input-primary w-full"
                    disabled={isLoading}
                  />
                  {form.formState.errors.logoUrl && (
                    <label className="label">
                      <span className="label-text-alt text-error">{form.formState.errors.logoUrl.message}</span>
                    </label>
                  )}
                </div>

                <p className="text-sm text-base-content/60">DaisyUI theme styles are applied automatically.</p>
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary w-full mt-2">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Setting up..." : "Complete Setup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
