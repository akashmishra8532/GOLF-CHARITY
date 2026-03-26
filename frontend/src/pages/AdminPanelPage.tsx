import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Alert } from "../components/Alert";
import { Spinner } from "../components/Spinner";

type AdminUser = { _id: string; email: string; name: string; role: "User" | "Admin"; charityId: string; contributionPercent: number };

type Charity = { id: string; name: string; slug: string; description?: string; imageUrl?: string };

type WinnerRow = {
  _id: string;
  userId: { name: string; email: string };
  drawId: { drawMonth: string; status: string };
  tier: 3 | 4 | 5;
  matchCount: number;
  verificationStatus: "pending" | "approved" | "rejected";
  paymentStatus: "pending" | "paid";
  proofImagePath?: string;
  payoutCents: number;
};

type ScoreRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  value: number;
  date: string | Date;
};

export function AdminPanelPage() {
  const apiBase = useMemo(() => import.meta.env.VITE_API_URL ?? "http://localhost:4000", []);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);

  // Draw controls
  const [drawMonth, setDrawMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const [drawMode, setDrawMode] = useState<"random" | "frequency">("frequency");
  const [drawId, setDrawId] = useState<string>("");
  const [drawSim, setDrawSim] = useState<any>(null);
  const [drawPublishRes, setDrawPublishRes] = useState<any>(null);

  // Charity form
  const [cName, setCName] = useState("");
  const [cSlug, setCSlug] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cImageUrl, setCImageUrl] = useState("");
  const [editingCharityId, setEditingCharityId] = useState<string | null>(null);

  // Admin score editing
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editingScoreValue, setEditingScoreValue] = useState<number>(18);
  const [editingScoreDate, setEditingScoreDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  function resetErrors() {
    setError(null);
  }

  async function loadAll() {
    resetErrors();
    try {
      setBusy(true);
      const [an, us, subs, cs, win, scr] = await Promise.all([
        api.get("/api/admin/analytics"),
        api.get("/api/admin/users"),
        api.get("/api/admin/subscriptions"),
        api.get("/api/admin/charities"),
        api.get("/api/admin/winners?status=pending"),
        api.get("/api/admin/scores?limit=30"),
      ]);
      setAnalytics(an.data.metrics);
      setUsers(us.data.users);
      setSubscriptions(subs.data.subscriptions);
      setCharities(cs.data.charities);
      setWinners(win.data.winners);
      setScores(scr.data.scores ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Admin load failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createDraw() {
    setBusy(true);
    setError(null);
    setDrawSim(null);
    setDrawPublishRes(null);
    try {
      const res = await api.post("/api/draws/create", { drawMonth });
      setDrawId(res.data.draw._id);
      setDrawSim(null);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to create draw");
    } finally {
      setBusy(false);
    }
  }

  async function simulate() {
    if (!drawId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(`/api/draws/${drawId}/simulate`, { mode: drawMode });
      setDrawSim(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Simulation failed");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!drawId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(`/api/draws/${drawId}/publish`);
      setDrawPublishRes(res.data);
      // Refresh pending winners
      const win = await api.get("/api/admin/winners?status=pending");
      setWinners(win.data.winners);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function createCharity() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: cName,
        slug: cSlug || cName.toLowerCase().replace(/\s+/g, "-"),
        description: cDescription,
        imageUrl: cImageUrl || undefined,
      };

      if (editingCharityId) {
        await api.put(`/api/admin/charities/${editingCharityId}`, payload);
      } else {
        await api.post("/api/admin/charities", payload);
      }

      setCName("");
      setCSlug("");
      setCDescription("");
      setCImageUrl("");
      setEditingCharityId(null);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Charity creation failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCharity(charityId: string) {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/api/admin/charities/${charityId}`);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  function startEditCharity(charity: Charity) {
    setEditingCharityId(charity.id);
    setCName(charity.name ?? "");
    setCSlug(charity.slug ?? "");
    setCDescription(charity.description ?? "");
    setCImageUrl(charity.imageUrl ?? "");
  }

  function cancelEditCharity() {
    setEditingCharityId(null);
    setCName("");
    setCSlug("");
    setCDescription("");
    setCImageUrl("");
  }

  async function reviewWinner(winnerId: string, decision: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/admin/winners/${winnerId}/review`, { decision });
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Review failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEditedScore() {
    if (!editingScoreId) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/api/admin/scores/${editingScoreId}`, {
        value: editingScoreValue,
        date: editingScoreDate,
      });
      setEditingScoreId(null);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Score update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="mt-1 text-sm text-slate-600">Manage draws, charities, and winner verification.</p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={loadAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      ) : null}

      {busy && !analytics ? (
        <div className="py-12 flex justify-center">
          <Spinner size={28} />
        </div>
      ) : null}

      {analytics ? (
        <div className="grid gap-4 md:grid-cols-6">
          {[
            { label: "Total users", value: analytics.totalUsers },
            { label: "Active subscribers", value: analytics.activeSubscribers },
            { label: "Revenue", value: `$${(analytics.revenueCents / 100).toFixed(2)}` },
            { label: "Prize pool", value: `$${(analytics.prizePoolCents / 100).toFixed(2)}` },
            { label: "Charity contributions", value: `$${(analytics.charityContributionCents / 100).toFixed(2)}` },
            { label: "Published draws", value: analytics.publishedDrawCount },
          ].map((x) => (
            <div key={x.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="text-xs font-semibold text-slate-500">{x.label}</div>
              <div className="mt-2 text-xl font-bold">{x.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft space-y-4">
          <div className="font-semibold">Monthly draw</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-600">drawMonth (YYYY-MM)</div>
              <input
                value={drawMonth}
                onChange={(e) => setDrawMonth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Mode</div>
              <select
                value={drawMode}
                onChange={(e) => setDrawMode(e.target.value as any)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white"
              >
                <option value="random">Random draw</option>
                <option value="frequency">Algorithm-based</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button disabled={busy} onClick={createDraw} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              Create draw
            </button>
            <button disabled={busy || !drawId} onClick={simulate} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
              Simulate
            </button>
            <button disabled={busy || !drawId} onClick={publish} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
              Publish
            </button>
          </div>

          {drawSim ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold">Simulation result</div>
              <div className="mt-2 text-xs text-slate-600">Drawn numbers: {drawSim.drawnNumbers?.join(", ")}</div>
              <div className="mt-3 text-xs font-semibold text-slate-700">Estimated winners</div>
              <div className="mt-2 space-y-2">
                {drawSim.winnersPreview?.length ? (
                  drawSim.winnersPreview.slice(0, 20).map((w: any) => (
                    <div key={`${w.userId}-${w.tier}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
                      <span className="font-semibold">{w.tier}-match</span>
                      <span className="text-slate-600">User: {w.userId.slice(-6)}</span>
                      <span className="font-semibold">${(w.payoutCents / 100).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-600">No winners predicted for this simulation.</div>
                )}
              </div>
              {drawSim.winnersPreview?.length > 20 ? (
                <div className="mt-2 text-xs text-slate-500">Showing first 20 winners preview entries.</div>
              ) : null}
            </div>
          ) : null}

          {drawPublishRes ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold">Published</div>
              <div className="mt-1 text-xs text-slate-600">Jackpot rollover to next: {(drawPublishRes.jackpotRolloverToNextCents / 100).toFixed(2)}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft space-y-4">
          <div className="font-semibold">Winner verification (Pending)</div>
          {winners.length ? (
            <div className="space-y-3">
              {winners.map((w) => (
                <div key={w._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">
                        {w.tier}-match • {w.drawId?.drawMonth}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {w.userId?.name} ({w.userId?.email})
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Match count: {w.matchCount} • Payout: ${(w.payoutCents / 100).toFixed(2)}
                      </div>
                      {w.proofImagePath ? (
                        <img
                          className="mt-3 max-h-48 w-full rounded-xl border border-slate-200 bg-white object-contain"
                          alt="Proof"
                          src={w.proofImagePath.startsWith("/") ? `${apiBase}${w.proofImagePath}` : w.proofImagePath}
                        />
                      ) : (
                        <div className="mt-3 text-xs text-slate-500">No proof image uploaded yet.</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <button
                      disabled={busy}
                      onClick={() => reviewWinner(w._id, "approve")}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => reviewWinner(w._id, "reject")}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-600">No pending winners right now.</div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Scores (Admin edit)</div>
            <div className="mt-1 text-xs text-slate-500">Stableford 1–45 • Rolling last-5 enforced</div>
          </div>
          <div className="text-xs text-slate-500">
            Showing {scores.length} recent score records
          </div>
        </div>

        {scores.length ? (
          <div className="mt-4 space-y-3">
            {scores.slice(0, 12).map((s) => {
              const isEditing = editingScoreId === s.id;
              const dateStr =
                typeof s.date === "string"
                  ? s.date.slice(0, 10)
                  : new Date(s.date).toISOString().slice(0, 10);
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        {s.userName || s.userEmail || s.userId}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Score: {s.value} • Date: {dateStr}
                      </div>
                    </div>

                    {!isEditing ? (
                      <button
                        disabled={busy}
                        onClick={() => {
                          setEditingScoreId(s.id);
                          setEditingScoreValue(s.value);
                          setEditingScoreDate(dateStr);
                        }}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="number"
                          min={1}
                          max={45}
                          value={editingScoreValue}
                          onChange={(e) => setEditingScoreValue(Number(e.target.value))}
                          className="w-28 rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"
                        />
                        <input
                          type="date"
                          value={editingScoreDate}
                          onChange={(e) => setEditingScoreDate(e.target.value)}
                          className="rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={busy}
                            onClick={saveEditedScore}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => setEditingScoreId(null)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-600">No scores found.</div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft space-y-4">
          <div className="font-semibold">Charity management</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
            <input placeholder="Slug" value={cSlug} onChange={(e) => setCSlug(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5" />
            <input placeholder="Image URL (optional)" value={cImageUrl} onChange={(e) => setCImageUrl(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" />
            <input placeholder="Description (optional)" value={cDescription} onChange={(e) => setCDescription(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" />
          </div>
          <button disabled={busy} onClick={createCharity} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {editingCharityId ? "Update charity" : "Create charity"}
          </button>
          {editingCharityId ? (
            <button
              disabled={busy}
              onClick={cancelEditCharity}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null}

          <div className="pt-3 border-t border-slate-200">
            <div className="text-sm font-semibold">Existing charities</div>
            <div className="mt-3 space-y-2">
              {charities.slice(0, 8).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">{c.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={busy}
                      onClick={() => startEditCharity(c)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => deleteCharity(c.id)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {charities.length > 8 ? <div className="mt-2 text-xs text-slate-500">Showing first 8 charities.</div> : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft space-y-4">
          <div className="font-semibold">Users & subscriptions</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold">Users</div>
              <div className="mt-2 space-y-2">
                {users.slice(0, 8).map((u) => (
                  <div key={u._id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs text-slate-600">{u.email}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Role: <span className="font-semibold">{u.role}</span>
                    </div>
                  </div>
                ))}
              </div>
              {users.length > 8 ? <div className="mt-2 text-xs text-slate-500">Showing first 8 users.</div> : null}
            </div>

            <div>
              <div className="text-sm font-semibold">Subscriptions</div>
              <div className="mt-2 space-y-2">
                {subscriptions.slice(0, 8).map((s) => (
                  <div key={s._id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <div className="font-semibold capitalize">{s.status}</div>
                    <div className="text-xs text-slate-600">Plan: {s.planInterval}</div>
                    <div className="mt-1 text-xs text-slate-500">Period end: {s.currentPeriodEnd ? String(new Date(s.currentPeriodEnd).toISOString().slice(0, 10)) : "—"}</div>
                  </div>
                ))}
              </div>
              {subscriptions.length > 8 ? <div className="mt-2 text-xs text-slate-500">Showing first 8 subscriptions.</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

