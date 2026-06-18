import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CardSwap, { Card } from "@/components/ui/card-swap";
import { featureCards } from "@/lib/marketing";

export default function HomePage() {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <header className="absolute right-0 top-0 z-20 flex items-center gap-3 p-6">
        <Link to="/login">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/80 hover:bg-white/15"
          >
            Log in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm" className="bg-white text-black hover:bg-white/90">
            Sign up
          </Button>
        </Link>
      </header>

      {/* Left */}
      <div className="flex flex-col justify-center px-8 py-24 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
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
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            <li>See every task, column, and deadline in one place</li>
            <li>Collaborate on public boards or keep work private</li>
            <li>Drag tasks across columns as priorities shift</li>
          </ul>

          <div className="mt-10 flex gap-3 lg:hidden">
            <Link to="/login">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white/80"
              >
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-black hover:bg-white/90">
                Sign up
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right */}
      <div className="relative hidden min-h-screen items-center justify-center overflow-hidden lg:flex">
        <CardSwap
          width={480}
          height={320}
          pauseOnHover
          className="!static !translate-x-0 !translate-y-0 !scale-100"
        >
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
    </div>
  );
}
