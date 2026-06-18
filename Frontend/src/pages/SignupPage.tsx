import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/errors";
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
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      await signup(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: hero */}
      <div className="relative hidden flex-col justify-center px-12 lg:flex">
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
            Use Provision for FREE for EVER for YOU!
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

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Create account
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Start organising your projects in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/80"
              >
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
                disabled={submitting}
                aria-describedby={error ? "signup-error" : undefined}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/80"
              >
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
                disabled={submitting}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            {error && (
              <p
                id="signup-error"
                className="text-sm text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
