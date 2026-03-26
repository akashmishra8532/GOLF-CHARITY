import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Spinner } from "../components/Spinner";
import { Alert } from "../components/Alert";
import type { AppUser } from "../store/authSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

type SubscriptionStatus = "active" | "expired" | "cancelled";

type Charity = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type DashboardSummary = {
  subscription: { status: SubscriptionStatus; planInterval?: "monthly" | "yearly"; currentPeriodEnd?: string | Date };
  scores: Array<{ id: string; value: number; date: string | Date }>;
  winningsCents: number;
  participationCount: number;
  charity: Charity | null;
  contributionPercent: number | null;
};

type Winner = {
  id: string;
  drawId: string;
  drawMonth: string;
  tier: 3 | 4 | 5;
  matchCount: number;
  verificationStatus: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "paid";
  proofImageUrl?: string;
  payoutCents: number;
};

export function DashboardPage() {
  const apiBase = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const authUser = useSelector((s: RootState) => s.auth.user) as AppUser | null;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [profile, setProfile] = useState<{
    id?: string;
    email: string;
    name: string;
    charityId: string;
    contributionPercent: number;
  } | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [charities, setCharities] = useState<Array<{ id: string; name: string }>>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scoreValue, setScoreValue] = useState<number>(18);
  const [scoreDate, setScoreDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(18);
  const [editingDate, setEditingDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(null);
      try {
        const [sumRes, profRes, winRes, charitiesRes] = await Promise.all([
          api.get("/api/dashboard/summary"),
          api.get("/api/profile"),
          api.get("/api/winners/my"),
          api.get("/api/charities"),
        ]);
        if (!mounted) return;
        setSummary(sumRes.data);
        setProfile(profRes.data.user);
        setWinners(winRes.data.winners);
        setCharities((charitiesRes.data.charities ?? []).map((c: any) => ({ id: c.id, name: c.name })));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.response?.data?.error ?? "Failed to load dashboard");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshSummary() {
    const res = await api.get("/api/dashboard/summary");
    setSummary(res.data);
  }

  const isSubscribed = summary?.subscription.status === "active";
  const subscriptionLabel = summary?.subscription.status === "active" ? "active" : "inactive";
  const renewalDate = summary?.subscription.currentPeriodEnd
    ? new Date(summary.subscription.currentPeriodEnd).toISOString().slice(0, 10)
    : null;

  async function saveProfile() {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.put("/api/profile", {
        name: profile.name,
        charityId: profile.charityId,
        contributionPercent: profile.contributionPercent,
        email: profile.email,
      });
      setProfile(res.data.user);
      await refreshSummary();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Profile update failed");
    } finally {
      setBusy(false);
    }
  }

  async function addScore() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/scores", {
        value: scoreValue,
        date: scoreDate,
      });
      await refreshSummary();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Score submission failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadWinnerProof(winnerId: string, file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("proof", file);
      // Let the browser/axios set the correct multipart boundary header.
      await api.post(`/api/winners/${winnerId}/upload`, fd);
      const winRes = await api.get("/api/winners/my");
      setWinners(winRes.data.winners);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">
            Scores (last 5), winnings, participation, and subscription verification.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
          <div className="text-xs text-slate-500">Subscription status</div>
          <div className="mt-1 text-lg font-semibold capitalize">{subscriptionLabel}</div>
          {renewalDate ? (
            <div className="mt-1 text-xs text-slate-500">Renewal: {renewalDate}</div>
          ) : null}
        </div>
      </div>

      {error ? (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      ) : null}

      {!summary ? (
        <div className="py-12 flex justify-center">
          <Spinner size={28} />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="md:col-span-1 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="font-semibold">Your stats</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Winnings</span>
                  <span className="font-semibold">
                    ${(summary.winningsCents / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Participation</span>
                  <span className="font-semibold">{summary.participationCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Plan</span>
                  <span className="font-semibold capitalize">{summary.subscription.planInterval ?? "—"}</span>
                </div>
                {summary.charity ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Charity</span>
                    <span className="font-semibold">{summary.charity.name}</span>
                  </div>
                ) : null}
                {summary.contributionPercent !== null ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Contribution</span>
                    <span className="font-semibold">{summary.contributionPercent}%</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">Profile</div>
                <div className="text-xs text-slate-500">Active only to save</div>
              </div>
              {profile ? (
                <div className="mt-4 space-y-3">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                    value={profile.name ?? ""}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isSubscribed || busy}
                    placeholder="Name"
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                    value={profile.email ?? ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isSubscribed || busy}
                    placeholder="Email"
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                    type="number"
                    min={10}
                    max={100}
                    value={profile.contributionPercent ?? 10}
                    onChange={(e) => setProfile({ ...profile, contributionPercent: Number(e.target.value) })}
                    disabled={!isSubscribed || busy}
                  />
                  <select
                    value={profile.charityId ?? ""}
                    onChange={(e) => setProfile({ ...profile, charityId: e.target.value })}
                    disabled={!isSubscribed || busy}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                  >
                    <option value="" disabled>
                      Select charity
                    </option>
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!isSubscribed || busy}
                    onClick={saveProfile}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {busy ? "Saving..." : "Save"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">Latest scores (Stableford 1–45)</div>
                <div className="text-xs text-slate-500">Newest first</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summary.scores.length ? (
                  summary.scores.map((s) => (
                    <div key={s.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                      <div className="text-xs text-slate-500">Score</div>
                      {editingScoreId === s.id ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="number"
                            min={1}
                            max={45}
                            value={editingValue}
                            onChange={(e) => setEditingValue(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"
                          />
                          <input
                            type="date"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                              disabled={busy}
                              onClick={async () => {
                                setBusy(true);
                                setError(null);
                                try {
                                  await api.put(`/api/scores/${s.id}`, {
                                    value: editingValue,
                                    date: editingDate,
                                  });
                                  setEditingScoreId(null);
                                  await refreshSummary();
                                } catch (e: any) {
                                  setError(e?.response?.data?.error ?? "Score update failed");
                                } finally {
                                  setBusy(false);
                                }
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                              disabled={busy}
                              onClick={() => setEditingScoreId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="text-xl font-bold">{s.value}</div>
                          <div className="mt-1 text-xs text-slate-600">
                            {new Date(s.date).toISOString().slice(0, 10)}
                          </div>
                          {isSubscribed ? (
                            <button
                              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                              disabled={busy}
                              onClick={() => {
                                setEditingScoreId(s.id);
                                setEditingValue(s.value);
                                setEditingDate(new Date(s.date).toISOString().slice(0, 10));
                              }}
                            >
                              Edit score
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-600">No scores yet. Add your first score.</div>
                )}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="text-sm font-semibold">Add a new score</div>
                {!isSubscribed ? (
                  <div className="mt-2 text-sm text-slate-500">
                    Subscription inactive. Subscribe to submit scores.
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Score value</label>
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={scoreValue}
                        onChange={(e) => setScoreValue(Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Date</label>
                      <input
                        type="date"
                        value={scoreDate}
                        onChange={(e) => setScoreDate(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
                      />
                    </div>
                    <button
                      disabled={busy}
                      onClick={addScore}
                      className="sm:col-span-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busy ? "Submitting..." : "Submit score"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">Winners & Verification</div>
                <div className="text-xs text-slate-500">Admin review required</div>
              </div>

              {winners.length ? (
                <div className="mt-4 space-y-3">
                  {winners.map((w) => (
                    <div key={w.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="font-semibold">
                            {w.tier}-match • {w.drawMonth}
                          </div>
                          <div className="text-xs text-slate-600">
                            Match count: {w.matchCount} • Payout: ${(w.payoutCents / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Verification</div>
                          <div className="font-semibold capitalize">{w.verificationStatus}</div>
                          <div className="mt-1 text-xs text-slate-500">Payment</div>
                          <div className="font-semibold capitalize">{w.paymentStatus}</div>
                        </div>
                      </div>

                      {w.proofImageUrl ? (
                        <div className="mt-3">
                          <img
                            src={w.proofImageUrl.startsWith("/") ? `${apiBase}${w.proofImageUrl}` : w.proofImageUrl}
                            alt="Winner proof"
                            className="max-h-60 w-full rounded-xl border border-slate-200 object-contain bg-white"
                          />
                        </div>
                      ) : null}

                      {isSubscribed && w.verificationStatus === "pending" && w.paymentStatus === "pending" ? (
                        <ProofUpload
                          disabled={busy}
                          onUpload={(file) => uploadWinnerProof(w.id, file)}
                        />
                      ) : null}

                      {w.verificationStatus === "rejected" ? (
                        <div className="mt-2 text-xs text-rose-700">Rejected by admin.</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-600">No winners assigned yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProofUpload({
  disabled,
  onUpload,
}: {
  disabled: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
        disabled={disabled}
      />
      <button
        disabled={disabled || !file}
        onClick={() => (file ? onUpload(file) : undefined)}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        Upload proof
      </button>
    </div>
  );
}

