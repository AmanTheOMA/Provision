import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CardSwap, { Card } from "@/components/ui/card-swap";
import { featureCards } from "@/lib/marketing";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signup(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string; errors?: { msg: string }[] } };
      };
      const message =
        axiosErr.response?.data?.error ??
        axiosErr.response?.data?.errors?.[0]?.msg ??
        "Signup failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-center bg-neutral-950 px-12 lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-white/50">
            Provision
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
            Ship projects with clarity, not chaos.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/60">
            Provision is your Kanban command center — plan in columns, track
            deadlines, and move work forward without the noise.
          </p>
        </motion.div>

        <CardSwap width={420} height={280} pauseOnHover>
          {featureCards.map((card) => (
            <Card
              key={card.title}
              className="flex flex-col justify-end p-6 text-white"
            >
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-white/70">{card.body}</p>
            </Card>
          ))}
        </CardSwap>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start organizing your projects in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
