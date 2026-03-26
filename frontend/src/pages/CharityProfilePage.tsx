import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { Spinner } from "../components/Spinner";
import { Alert } from "../components/Alert";

type Charity = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export function CharityProfilePage() {
  const apiBase = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const { charityId } = useParams<{ charityId: string }>();

  const [charity, setCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!charityId) return;
    let mounted = true;
    setError(null);
    setLoading(true);
    api
      .get(`/api/charities/${charityId}`)
      .then((res) => {
        if (!mounted) return;
        setCharity(res.data.charity);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.response?.data?.error ?? "Failed to load charity");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [charityId]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  if (!charity) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="h-28 w-full overflow-hidden rounded-2xl bg-slate-100 md:h-40 md:w-56">
            {charity.imageUrl ? (
              <img
                src={charity.imageUrl.startsWith("/") ? `${apiBase}${charity.imageUrl}` : charity.imageUrl}
                alt={charity.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-500">Charity</div>
            <h2 className="mt-1 text-2xl font-bold">{charity.name}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{charity.description || "—"}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to={`/signup?charityId=${encodeURIComponent(charity.id)}`}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 text-center"
              >
                Select for signup
              </Link>
              <Link to="/charities" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 text-center">
                Back to listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="text-sm font-semibold">What your contribution does</div>
        <p className="mt-2 text-sm text-slate-600">
          Your selected charity receives a portion of your subscription fee. You can adjust your contribution percentage any time while subscribed.
        </p>
      </div>
    </div>
  );
}

