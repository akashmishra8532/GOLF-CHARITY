import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { login, signup } from "../store/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { Alert } from "../components/Alert";

type Charity = { id: string; name: string };

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { token } = useSelector((s: RootState) => s.auth);

  const [params] = useSearchParams();
  const preselectedCharityId = params.get("charityId") ?? "";

  const [charities, setCharities] = useState<Charity[]>([]);
  const [charityLoading, setCharityLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [charityId, setCharityId] = useState(preselectedCharityId);
  const [contributionPercent, setContributionPercent] = useState<number>(10);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode === "signup") {
      setCharityLoading(true);
      api
        .get("/api/charities")
        .then((res) => setCharities(res.data.charities))
        .catch((e) => setError(e?.response?.data?.error ?? "Failed to load charities"))
        .finally(() => setCharityLoading(false));
    }
  }, [mode]);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await dispatch(login({ email, password })).unwrap();
        navigate("/dashboard");
      } else {
        if (!charityId) throw new Error("Please select a charity");
        await dispatch(
          signup({ email, password, name, charityId, contributionPercent })
        ).unwrap();
        navigate("/subscription");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{mode === "login" ? "Login" : "Create account"}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "login"
              ? "Use your email and password to access your dashboard."
              : "Choose your charity and contribution percentage (min 10%)."}
          </p>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="error" title="Error">
              {error}
            </Alert>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" ? (
            <>
              <div>
                <label className="text-sm font-semibold">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder="Akash Mishra"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Charity</label>
                {charityLoading ? (
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                    <Spinner size={20} /> Loading charities...
                  </div>
                ) : (
                  <select
                    value={charityId}
                    onChange={(e) => setCharityId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                    required
                  >
                    <option value="" disabled>
                      Select a charity
                    </option>
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold">Contribution percentage</label>
                <input
                  type="number"
                  value={contributionPercent}
                  onChange={(e) => setContributionPercent(Number(e.target.value))}
                  min={10}
                  max={100}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
                  required
                />
                <div className="mt-1 text-xs text-slate-500">Minimum is 10%.</div>
              </div>
            </>
          ) : null}

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          <button
            disabled={busy}
            className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
            type="submit"
          >
            {busy ? "Working..." : mode === "login" ? "Login" : "Sign up"}
          </button>

          <div className="text-center text-sm text-slate-600">
            {mode === "login" ? (
              <>
                New here?{" "}
                <a className="font-semibold text-slate-900 hover:underline" href="/signup">
                  Create an account
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a className="font-semibold text-slate-900 hover:underline" href="/login">
                  Login
                </a>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

