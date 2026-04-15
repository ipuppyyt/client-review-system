"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2, User, Palette } from "lucide-react";

const setupSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  logoUrl: z.url("Please enter a valid URL").optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use format #000000"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use format #FFFFFF"),
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
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
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

      // Sign in the user automatically
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        console.error("Auto sign-in failed:", signInResult.error);
        // Still redirect to dashboard - they can log in manually if needed
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
            <p className="text-sm text-gray-600 mt-2">Set up your organization</p>
          </div>

          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Admin Account Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-700" />
                <h2 className="text-sm font-semibold text-gray-900">Admin Account</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Organization Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-gray-700" />
                <h2 className="text-sm font-semibold text-gray-900">Organization</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="orgName">
                  Organization Name
                </label>
                <input
                  {...form.register("orgName")}
                  id="orgName"
                  type="text"
                  placeholder="Acme Inc"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                />
                {form.formState.errors.orgName && (
                  <p className="text-xs text-red-500">{form.formState.errors.orgName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Organization Slug</label>
                <div className="flex items-center h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <span className="text-gray-400 mr-1">/r/</span>
                  <span className="font-mono">{slugPreview}</span>
                </div>
                <p className="text-xs text-gray-500">This will be your public review URL</p>
              </div>
            </div>

            {/* Branding Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-5 w-5 text-gray-700" />
                <h2 className="text-sm font-semibold text-gray-900">Branding</h2>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="logoUrl">
                  Logo URL (optional)
                </label>
                <input
                  {...form.register("logoUrl")}
                  id="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  disabled={isLoading}
                />
                {form.formState.errors.logoUrl && (
                  <p className="text-xs text-red-500">{form.formState.errors.logoUrl.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="primaryColor">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...form.register("primaryColor")}
                      id="primaryColor"
                      type="color"
                      className="h-10 w-12 rounded-md border border-gray-300 cursor-pointer"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      value={form.watch("primaryColor")}
                      onChange={(e) => form.setValue("primaryColor", e.target.value)}
                      className="flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-mono"
                      disabled={isLoading}
                    />
                  </div>
                  {form.formState.errors.primaryColor && (
                    <p className="text-xs text-red-500">{form.formState.errors.primaryColor.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="secondaryColor">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...form.register("secondaryColor")}
                      id="secondaryColor"
                      type="color"
                      className="h-10 w-12 rounded-md border border-gray-300 cursor-pointer"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      value={form.watch("secondaryColor")}
                      onChange={(e) => form.setValue("secondaryColor", e.target.value)}
                      className="flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-mono"
                      disabled={isLoading}
                    />
                  </div>
                  {form.formState.errors.secondaryColor && (
                    <p className="text-xs text-red-500">{form.formState.errors.secondaryColor.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white shadow hover:bg-gray-900/90 h-10 px-4 py-2"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Setting up..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
