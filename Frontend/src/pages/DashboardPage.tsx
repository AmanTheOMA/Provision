import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Provision</h1>
          <p className="text-sm text-muted-foreground">Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold">
            Welcome, {user?.email}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Project management features arrive in Phase 4. You are
            authenticated and ready.
          </p>
        </div>
      </main>
    </div>
  );
}
