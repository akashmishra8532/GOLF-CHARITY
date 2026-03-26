import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Spinner } from "../components/Spinner";
import { Link, useSearchParams } from "react-router-dom";

type Charity = { id: string; name: string; description: string; imageUrl: string; slug: string };

export function CharityListingPage() {
  const apiBase = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const [charities, setCharities] = useState<Charity[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params] = useSearchParams();
  const preselectedCharityId = params.get("charityId") ?? "";

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/charities")
      .then((res) => {
        if (!mounted) return;
        setCharities(res.data.charities);
      })
      .catch((e) => setError(e?.response?.data?.error ?? "Failed to load charities"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = charities.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (c.name ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Charities</h2>
          <p className="mt-1 text-slate-600">Pick a cause for your monthly contributions.</p>
        </div>
        <div className="text-xs text-slate-500">
          Tip: choose a charity during signup. Min contribution is 10%.
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="text-xs font-semibold text-slate-500">Search</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Search by name or description..."
        />
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner size={24} />
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{c.name}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description || "—"}</div>
                </div>
                <div className="h-10 w-10 overflow-hidden rounded-2xl bg-slate-100">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl.startsWith("/") ? `${apiBase}${c.imageUrl}` : c.imageUrl}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link
                  to={`/signup?charityId=${encodeURIComponent(c.id)}`}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Choose for signup
                </Link>
                {preselectedCharityId === c.id ? (
                  <div className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                    Preselected
                  </div>
                ) : null}
                <Link
                  to={`/charities/${c.id}`}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

