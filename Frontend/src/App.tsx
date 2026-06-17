import { useEffect, useState } from "react";
import api from "@/services/api";

type HealthStatus = {
  status: string;
  database: string;
  timestamp: string;
};

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<HealthStatus>("/health")
      .then((res) => setHealth(res.data))
      .catch(() => setError("Unable to reach backend"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Provision</h1>
        <p className="mt-2 text-muted-foreground">
          Kanban project management — Phase 1 setup
        </p>
      </div>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <h2 className="text-sm font-medium text-muted-foreground">
          System Status
        </h2>

        {loading && (
          <p className="mt-4 text-sm text-muted-foreground">Checking...</p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        {health && (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frontend</dt>
              <dd className="font-medium text-emerald-400">Running</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Backend</dt>
              <dd className="font-medium text-emerald-400">{health.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Database</dt>
              <dd
                className={`font-medium ${
                  health.database === "connected"
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {health.database}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
