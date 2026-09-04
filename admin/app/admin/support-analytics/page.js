'use client';
import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Sparkles, AlertTriangle, Timer, CheckCircle2 } from 'lucide-react';

const RANGES = [7, 30, 90];

export default function SupportAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/support-analytics?days=${days}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto" data-testid="support-analytics-page">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="text-2xl font-bold text-slate-900">Support Analytics</div>
          <div className="text-sm text-slate-500">Resolution time · SLA compliance · AI resolution & escalation</div>
        </div>
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              data-testid={`range-${r}`}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${days === r ? 'bg-[#0A3D34] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="text-emerald-700 p-8">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat icon={Timer} color="text-blue-600" label="Avg Resolution" value={`${data.resolution?.avg_hours ?? 0} h`} sub={`${data.resolution?.resolved_count ?? 0} resolved`} />
            <Stat icon={Clock} color="text-indigo-600" label="Avg First Response" value={`${data.resolution?.avg_first_response_hours ?? 0} h`} />
            <Stat icon={ShieldCheck} color="text-emerald-600" label="SLA Compliance" value={`${data.sla?.compliance_pct ?? 0}%`} sub={`${data.sla?.breached ?? 0} breached`} />
            <Stat icon={Sparkles} color="text-amber-600" label="AI Resolution Rate" value={`${data.ai?.ai_resolution_rate_pct ?? 0}%`} sub={`${data.ai?.auto_replied ?? 0} auto-replied`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-sm font-bold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> AI Support Performance</div>
              <Row label="Total AI suggestions" value={data.ai?.suggestions_total ?? 0} />
              <Row label="Auto-replied (resolved by AI)" value={data.ai?.auto_replied ?? 0} good />
              <Row label="Suggested-only (agent reviewed)" value={data.ai?.suggested_only ?? 0} />
              <Row label="Escalated to human" value={data.ai?.escalated ?? 0} warn />
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Escalation rate</span>
                <span className="font-bold text-rose-600">{data.ai?.escalation_rate_pct ?? 0}%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-sm font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ticket Breakdown</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">By status</div>
              {Object.entries(data.totals?.by_status || {}).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2 mt-4">By category</div>
              {Object.entries(data.totals?.by_category || {}).map(([k, v]) => (
                <Row key={k} label={k} value={v} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Row({ label, value, good, warn }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="capitalize text-slate-600">{String(label).replace(/_/g, ' ')}</span>
      <span className={`font-bold ${good ? 'text-emerald-600' : warn ? 'text-rose-600' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}
