import { useEffect, useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const METERS = [
  { id: "m1", name: "API Calls", event_name: "api_call", aggregation: "COUNT", unit: "requests", status: "active", merchant: "TechFlow s.r.o.", usage: 842_300, limit: 1_000_000, created: "2025-01-10" },
  { id: "m2", name: "PDF Exporty", event_name: "pdf_exported", aggregation: "COUNT", unit: "ks", status: "active", merchant: "DocuMaster AG", usage: 14_220, limit: 50_000, created: "2025-02-03" },
  { id: "m3", name: "Data Transfer", event_name: "data_transfer", aggregation: "SUM", unit: "GB", status: "active", merchant: "StreamCore Ltd", usage: 3_840, limit: 10_000, created: "2025-01-28" },
  { id: "m4", name: "AI Inferencie", event_name: "ai_inference", aggregation: "COUNT", unit: "calls", status: "active", merchant: "NeuralBit s.r.o.", usage: 56_100, limit: 100_000, created: "2025-03-01" },
  { id: "m5", name: "CPU Time", event_name: "cpu_time", aggregation: "SUM", unit: "sekundy", status: "warning", merchant: "ComputeHub", usage: 89_400, limit: 100_000, created: "2025-02-15" },
  { id: "m6", name: "Rezervácie", event_name: "reservation_created", aggregation: "COUNT", unit: "ks", status: "active", merchant: "BookSmart s.r.o.", usage: 2_340, limit: 10_000, created: "2025-03-10" },
];

const EVENTS = [
  { id: "e1", event_name: "api_call", customer_id: "cust_0012", value: 1, timestamp: "2025-03-30T14:22:11Z", meter: "API Calls", status: "processed" },
  { id: "e2", event_name: "pdf_exported", customer_id: "cust_0087", value: 1, timestamp: "2025-03-30T14:19:43Z", meter: "PDF Exporty", status: "processed" },
  { id: "e3", event_name: "data_transfer", customer_id: "cust_0033", value: 2.4, timestamp: "2025-03-30T14:17:02Z", meter: "Data Transfer", status: "processed" },
  { id: "e4", event_name: "ai_inference", customer_id: "cust_0055", value: 1, timestamp: "2025-03-30T14:15:59Z", meter: "AI Inferencie", status: "processed" },
  { id: "e5", event_name: "cpu_time", customer_id: "cust_0091", value: 45.2, timestamp: "2025-03-30T14:12:31Z", meter: "CPU Time", status: "processed" },
  { id: "e6", event_name: "api_call", customer_id: "cust_0012", value: 1, timestamp: "2025-03-30T14:11:08Z", meter: "API Calls", status: "processed" },
  { id: "e7", event_name: "reservation_created", customer_id: "cust_0200", value: 1, timestamp: "2025-03-30T14:09:55Z", meter: "Rezervácie", status: "failed" },
  { id: "e8", event_name: "pdf_exported", customer_id: "cust_0087", value: 1, timestamp: "2025-03-30T14:07:22Z", meter: "PDF Exporty", status: "processed" },
];

const USAGE_CHART = [
  { day: "24.3", events: 12_400, volume: 890 },
  { day: "25.3", events: 15_800, volume: 1_200 },
  { day: "26.3", events: 11_200, volume: 750 },
  { day: "27.3", events: 18_900, volume: 1_640 },
  { day: "28.3", events: 22_300, volume: 2_100 },
  { day: "29.3", events: 19_700, volume: 1_880 },
  { day: "30.3", events: 24_100, volume: 2_340 },
];

const PIE_DATA = [
  { name: "API Calls", value: 842300 },
  { name: "AI Inferencie", value: 56100 },
  { name: "PDF Exporty", value: 14220 },
  { name: "CPU Time", value: 89400 },
  { name: "Rezervácie", value: 2340 },
];

const ALERTS = [
  { id: "a1", meter: "CPU Time", merchant: "ComputeHub", threshold: 80, current: 89.4, status: "firing", created: "2025-03-30T12:00:00Z" },
  { id: "a2", meter: "API Calls", merchant: "TechFlow s.r.o.", threshold: 80, current: 84.2, status: "firing", created: "2025-03-30T09:30:00Z" },
  { id: "a3", meter: "Data Transfer", merchant: "StreamCore Ltd", threshold: 90, current: 38.4, status: "ok", created: "2025-03-28T08:00:00Z" },
];

const MERCHANTS = [
  { id: "mer1", name: "TechFlow s.r.o.", meters: 3, events_today: 14_220, plan: "Pro" },
  { id: "mer2", name: "DocuMaster AG", meters: 1, events_today: 892, plan: "Starter" },
  { id: "mer3", name: "StreamCore Ltd", meters: 2, events_today: 22_100, plan: "Enterprise" },
  { id: "mer4", name: "NeuralBit s.r.o.", meters: 2, events_today: 5_600, plan: "Pro" },
  { id: "mer5", name: "ComputeHub", meters: 1, events_today: 31_000, plan: "Enterprise" },
];

const CYAN = "#0057B8";
const CYAN2 = "#1E3A8A";
const WARN = "#C4930A";
const DANGER = "#0A2E6E";
const PIE_COLORS = [CYAN, CYAN2, "#4a4a4a", WARN, "#707070"];

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = { active: CYAN2, warning: WARN, error: DANGER, ok: CYAN2, firing: DANGER, processed: CYAN2, failed: DANGER };
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: colors[status] || "#D8E2F2",
      boxShadow: `0 0 6px ${colors[status] || "#D8E2F2"}`,
      marginRight: 6,
    }} />
  );
}

function StatCard({ label, value, sub, accent = CYAN, icon }) {
  return (
    <div style={{
      background: "rgba(11,26,51,0.04)",
      border: `1px solid rgba(11,26,51,0.10)`,
      borderRadius: 12,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: accent, opacity: 0.8 }} />
      <div style={{ fontSize: 11, color: "#C6D6EE", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 28, fontWeight: 700, color: "#0B1A33", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 8 }}>{sub}</div>}
      {icon && <div style={{ position: "absolute", bottom: 16, right: 20, fontSize: 28, opacity: 0.12 }}>{icon}</div>}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, variant = "ghost", onClick, small, disabled = false }) {
  const styles = {
    primary: { background: CYAN, color: "#fff", border: `1px solid ${CYAN}`, fontWeight: 700 },
    ghost: { background: "transparent", color: CYAN, border: `1px solid rgba(0,87,184,0.3)` },
    danger: { background: "transparent", color: DANGER, border: `1px solid rgba(30,58,138,0.3)` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      borderRadius: 8,
      padding: small ? "6px 14px" : "9px 20px",
      fontSize: small ? 12 : 13,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      fontFamily: "'Tatra banka Sans V1.0', sans-serif",
      letterSpacing: 0.3,
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

function ProgressBar({ value, max, color = CYAN }) {
  const pct = Math.min(100, (value / max) * 100);
  const c = pct > 85 ? DANGER : pct > 70 ? WARN : color;
  return (
    <div style={{ height: 4, background: "rgba(11,26,51,0.12)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 4, boxShadow: `0 0 8px ${c}` }} />
    </div>
  );
}

function Tag({ text, color = CYAN }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}40`, color,
      fontSize: 10, borderRadius: 5, padding: "2px 8px", letterSpacing: 1, textTransform: "uppercase",
    }}>{text}</span>
  );
}

// ── VIEWS ──────────────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 24, fontWeight: 800, color: "#0B1A33" }}>
          Prehľad systému
        </div>
        <div style={{ color: "#9CB5DB", fontSize: 13, marginTop: 4 }}>Posledná aktualizácia: práve teraz · 30. marca 2026</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Aktívne metre" value="6" sub="5 merchantov" icon="📊" />
        <StatCard label="Eventy dnes" value="24 100" sub="+12% vs včera" accent={CYAN2} icon="⚡" />
        <StatCard label="Aktívne alerty" value="2" sub="Kritické limity" accent={DANGER} icon="🔔" />
        <StatCard label="Merchantov" value="5" sub="2× Enterprise" accent="#4a4a4a" icon="🏢" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <SectionHeader title="Usage eventy – posledných 7 dní" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={USAGE_CHART}>
              <defs>
                <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CYAN} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,26,51,0.07)" />
              <XAxis dataKey="day" tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 8, color: "#0B1A33" }} />
              <Area type="monotone" dataKey="events" stroke={CYAN} strokeWidth={2} fill="url(#evGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <SectionHeader title="Distribúcia eventov" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 8, color: "#0B1A33" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {PIE_DATA.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                  <span style={{ color: "#D8E2F2" }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#ccc" }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Firing alerts */}
      {ALERTS.filter(a => a.status === "firing").length > 0 && (
        <div style={{ background: "rgba(30,58,138,0.05)", border: "1px solid rgba(30,58,138,0.2)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DANGER, marginBottom: 14, letterSpacing: 1 }}>⚠ AKTÍVNE ALERTY</div>
          {ALERTS.filter(a => a.status === "firing").map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(30,58,138,0.08)" }}>
              <div>
                <span style={{ color: "#0B1A33", fontWeight: 600 }}>{a.meter}</span>
                <span style={{ color: "#B5C9E8", margin: "0 8px" }}>·</span>
                <span style={{ color: "#D8E2F2", fontSize: 13 }}>{a.merchant}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 13, color: DANGER }}>
                  {a.current}% / {a.threshold}% threshold
                </div>
                <ProgressBar value={a.current} max={100} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent events mini */}
      <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
        <SectionHeader title="Posledné eventy" sub="Live stream" />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {EVENTS.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px 80px", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(11,26,51,0.07)", fontSize: 12 }}>
              <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: CYAN }}>{e.event_name}</span>
              <span style={{ color: "#C6D6EE" }}>{e.customer_id}</span>
              <span style={{ color: "#B5C9E8" }}>{e.timestamp.replace("T", " ").replace("Z", "")}</span>
              <span style={{ color: "#D8E2F2" }}>{e.meter}</span>
              <span><StatusDot status={e.status} /><span style={{ color: e.status === "processed" ? "#ccc" : DANGER }}>{e.status}</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetersView({ onNewMeter }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        title="Metre"
        sub={`${METERS.length} definovaných metrov`}
        action={<Btn variant="primary" onClick={onNewMeter}>+ Nový meter</Btn>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {METERS.map(m => {
          const pct = Math.round((m.usage / m.limit) * 100);
          const c = pct > 85 ? DANGER : pct > 70 ? WARN : CYAN;
          return (
            <div key={m.id} onClick={() => setSelected(m.id === selected ? null : m.id)}
              style={{
                background: selected === m.id ? "rgba(0,87,184,0.06)" : "rgba(11,26,51,0.04)",
                border: `1px solid ${selected === m.id ? "rgba(0,87,184,0.3)" : "rgba(11,26,51,0.10)"}`,
                borderRadius: 12, padding: 22, cursor: "pointer", transition: "all 0.2s"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>{m.name}</div>
                  <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 11, color: "#B5C9E8", marginTop: 3 }}>{m.event_name}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Tag text={m.aggregation} color={m.aggregation === "SUM" ? CYAN2 : CYAN} />
                  <StatusDot status={m.status} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#B5C9E8" }}>Využitie</span>
                  <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 11, color: c }}>{pct}%</span>
                </div>
                <ProgressBar value={m.usage} max={m.limit} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#B5C9E8" }}>{m.merchant}</span>
                <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#D8E2F2" }}>
                  {m.usage.toLocaleString()} / {m.limit.toLocaleString()} {m.unit}
                </span>
              </div>

              {selected === m.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(11,26,51,0.10)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                    {[["Merchant", m.merchant], ["Aggregation", m.aggregation], ["Unit", m.unit], ["Vytvorený", m.created]].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ color: "#B5C9E8", marginBottom: 3 }}>{k}</div>
                        <div style={{ color: "#ccc", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <Btn small>Upraviť</Btn>
                    <Btn small variant="danger">Deaktivovať</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventsView() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? EVENTS : EVENTS.filter(e => e.status === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader title="Usage Eventy" sub="Live stream prijatých eventov" />
      <div style={{ display: "flex", gap: 10 }}>
        {["all", "processed", "failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? CYAN : "transparent",
            color: filter === f ? "#fff" : "#C6D6EE",
            border: `1px solid ${filter === f ? CYAN : "rgba(11,26,51,0.16)"}`,
            borderRadius: 7, padding: "7px 16px", fontSize: 12, cursor: "pointer",
            fontFamily: "'Tatra banka Sans V1.0', sans-serif", transition: "all 0.15s",
          }}>{f === "all" ? "Všetky" : f}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Btn small>CSV Export</Btn>
          <Btn small variant="primary">+ Simulovať event</Btn>
        </div>
      </div>

      <div style={{ background: "rgba(11,26,51,0.03)", border: "1px solid rgba(11,26,51,0.12)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 1.5fr 1fr 80px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(11,26,51,0.12)", fontSize: 11, color: "#9CB5DB", letterSpacing: 1, textTransform: "uppercase" }}>
          {["Event Name", "Customer ID", "Value", "Timestamp", "Meter", "Status"].map(h => <span key={h}>{h}</span>)}
        </div>
        {filtered.map((e, i) => (
          <div key={e.id} style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 1.5fr 1fr 80px", gap: 12,
            padding: "13px 20px", borderBottom: "1px solid rgba(11,26,51,0.04)",
            background: i % 2 === 0 ? "transparent" : "rgba(11,26,51,0.02)",
            fontSize: 12, alignItems: "center"
          }}>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: CYAN, fontSize: 11 }}>{e.event_name}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#CFDCF0", fontSize: 11 }}>{e.customer_id}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#ccc" }}>{e.value}</span>
            <span style={{ color: "#B5C9E8", fontSize: 11 }}>{e.timestamp.replace("T", " ").replace("Z", "")}</span>
            <span style={{ color: "#D8E2F2" }}>{e.meter}</span>
            <span><StatusDot status={e.status} /><span style={{ color: e.status === "processed" ? "#999" : DANGER }}>{e.status}</span></span>
          </div>
        ))}
      </div>

      {/* Volume bar */}
      <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
        <SectionHeader title="Objem eventov – posledných 7 dní" />
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={USAGE_CHART}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,26,51,0.07)" />
            <XAxis dataKey="day" tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 8, color: "#0B1A33" }} />
            <Bar dataKey="events" fill={CYAN} radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PricingView() {
  const tiers = [
    { from: 0, to: 1000, price: "0.00 €", label: "Free tier" },
    { from: 1001, to: 10000, price: "0.002 €", label: "Štandard" },
    { from: 10001, to: 100000, price: "0.0015 €", label: "Rozšírený" },
    { from: 100001, to: "∞", price: "0.001 €", label: "Enterprise" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader title="Cenové modely" sub="Tarifné nastavenia pre metre merchantov" action={<Btn variant="primary">+ Nový tarif</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Tiered pricing */}
        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>API Calls – Stupňovaná cena</div>
            <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 4 }}>TechFlow s.r.o. · COUNT aggregation</div>
          </div>
          {tiers.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: i === 0 ? "rgba(0,255,200,0.06)" : "transparent", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: "#D8E2F2" }}>{t.label}</div>
                <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 11, color: "#B5C9E8" }}>{t.from.toLocaleString()} – {typeof t.to === "number" ? t.to.toLocaleString() : t.to}</div>
              </div>
              <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 16, fontWeight: 700, color: i === 0 ? CYAN2 : "#0B1A33" }}>{t.price}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Btn small>Upraviť</Btn>
          </div>
        </div>

        {/* Pay as you go */}
        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>Data Transfer – Pay-as-you-go</div>
            <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 4 }}>StreamCore Ltd · SUM aggregation</div>
          </div>
          <div style={{ background: "rgba(0,87,184,0.04)", border: "1px solid rgba(0,87,184,0.1)", borderRadius: 10, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#B5C9E8", marginBottom: 8 }}>Cena za GB</div>
            <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 36, fontWeight: 700, color: CYAN }}>0.012 €</div>
            <div style={{ fontSize: 11, color: "#9CB5DB", marginTop: 8 }}>bez limitu · žiadny free tier</div>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(11,26,51,0.03)", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#C6D6EE" }}>Tento mesiac (3 840 GB)</span>
              <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#0B1A33" }}>46.08 €</span>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <Btn small>Upraviť</Btn>
          </div>
        </div>

        {/* Credits model */}
        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>AI Inferencie – Kreditový model</div>
            <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 4 }}>NeuralBit s.r.o. · COUNT aggregation</div>
          </div>
          {[
            { pack: "Starter", credits: "10 000", price: "19 €", highlight: false },
            { pack: "Growth", credits: "50 000", price: "79 €", highlight: true },
            { pack: "Scale", credits: "200 000", price: "249 €", highlight: false },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: p.highlight ? "rgba(0,87,184,0.08)" : "transparent", border: p.highlight ? `1px solid rgba(0,87,184,0.2)` : "1px solid transparent", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, color: p.highlight ? CYAN : "#ccc" }}>{p.pack}</div>
                <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 11, color: "#B5C9E8" }}>{p.credits} kreditov</div>
              </div>
              <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 16, fontWeight: 700, color: p.highlight ? CYAN : "#0B1A33" }}>{p.price}</div>
            </div>
          ))}
        </div>

        {/* Fixed fee */}
        <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>Rezervácie – Subscription + Usage</div>
            <div style={{ fontSize: 12, color: "#B5C9E8", marginTop: 4 }}>BookSmart s.r.o. · Hybridný model</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "rgba(11,26,51,0.04)", borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#B5C9E8", marginBottom: 6 }}>Mesačný paušál</div>
              <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 22, color: "#0B1A33" }}>29 €</div>
            </div>
            <div style={{ flex: 1, background: "rgba(0,87,184,0.04)", border: "1px solid rgba(0,87,184,0.1)", borderRadius: 8, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#B5C9E8", marginBottom: 6 }}>Nad 1 000 ks</div>
              <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 22, color: CYAN }}>0.02 €/ks</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#9CB5DB" }}>Prvých 1 000 rezervácií v cene. Každá ďalšia sa fakturuje osobitne.</div>
        </div>
      </div>
    </div>
  );
}

function AlertsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader title="Monitoring & Alerty" sub="Prahy a upozornenia pre metre" action={<Btn variant="primary">+ Nový alert</Btn>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ALERTS.map(a => {
          const pct = a.current;
          const c = pct > 85 ? DANGER : pct > 70 ? WARN : CYAN2;
          return (
            <div key={a.id} style={{ background: "rgba(11,26,51,0.04)", border: `1px solid ${a.status === "firing" ? "rgba(30,58,138,0.25)" : "rgba(11,26,51,0.10)"}`, borderRadius: 12, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>{a.meter}</span>
                    <Tag text={a.status === "firing" ? "FIRING" : "OK"} color={a.status === "firing" ? DANGER : CYAN2} />
                  </div>
                  <div style={{ fontSize: 12, color: "#B5C9E8" }}>{a.merchant}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 28, fontWeight: 700, color: c }}>{a.current}%</div>
                  <div style={{ fontSize: 11, color: "#9CB5DB" }}>threshold: {a.threshold}%</div>
                </div>
              </div>
              <ProgressBar value={a.current} max={100} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <Btn small>Upraviť threshold</Btn>
                {a.status === "firing" && <Btn small variant="danger">Potlačiť alert</Btn>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage history */}
      <div style={{ background: "rgba(11,26,51,0.04)", border: "1px solid rgba(11,26,51,0.10)", borderRadius: 12, padding: 24 }}>
        <SectionHeader title="CPU Time – história spotreby" sub="ComputeHub · Kritický meter" />
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={USAGE_CHART.map(d => ({ ...d, threshold: 80000 }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,26,51,0.07)" />
            <XAxis dataKey="day" tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#B5C9E8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 8, color: "#0B1A33" }} />
            <Line type="monotone" dataKey="volume" stroke={WARN} strokeWidth={2} dot={false} name="CPU Time" />
            <Line type="monotone" dataKey="threshold" stroke={DANGER} strokeWidth={1} strokeDasharray="5 5" dot={false} name="Threshold" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MerchantsView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader title="Merchantia" sub="Prehľad obchodníkov na platforme" action={<Btn variant="primary">+ Pridať merchanta</Btn>} />
      <div style={{ background: "rgba(11,26,51,0.03)", border: "1px solid rgba(11,26,51,0.12)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 1.5fr 1fr 100px", gap: 12, padding: "12px 24px", borderBottom: "1px solid rgba(11,26,51,0.12)", fontSize: 11, color: "#9CB5DB", letterSpacing: 1, textTransform: "uppercase" }}>
          {["Merchant", "Metre", "Eventy dnes", "Plán", "Akcia"].map(h => <span key={h}>{h}</span>)}
        </div>
        {MERCHANTS.map((m, i) => (
          <div key={m.id} style={{
            display: "grid", gridTemplateColumns: "2fr 80px 1.5fr 1fr 100px", gap: 12,
            padding: "16px 24px", borderBottom: "1px solid rgba(11,26,51,0.04)",
            background: i % 2 === 0 ? "transparent" : "rgba(11,26,51,0.02)",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0B1A33" }}>{m.name}</div>
            </div>
            <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: CYAN, fontSize: 13 }}>{m.meters}</div>
            <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#ccc", fontSize: 13 }}>{m.events_today.toLocaleString()}</div>
            <Tag text={m.plan} color={m.plan === "Enterprise" ? CYAN2 : m.plan === "Pro" ? CYAN : "#D8E2F2"} />
            <Btn small>Detail</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewMeterModal({ onClose }) {
  const [form, setForm] = useState({ name: "", event_name: "", aggregation: "COUNT", unit: "", limit: "" });
  const sanitizeText = (value, max = 64) => value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
  const sanitizeEventName = (value) => value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 64);
  const sanitizeLimit = (value) => value.replace(/[^0-9]/g, "").slice(0, 12);
  const set = (k, v) => {
    const normalized =
      k === "event_name"
        ? sanitizeEventName(v)
        : k === "limit"
          ? sanitizeLimit(v)
          : sanitizeText(v);
    setForm(f => ({ ...f, [k]: normalized }));
  };
  const canCreate = form.name.trim() && form.event_name.trim() && form.unit.trim();
  const inp = (label, key, placeholder) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "#B5C9E8", letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
      <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} maxLength={key === "limit" ? 12 : 64}
        style={{ background: "rgba(11,26,51,0.08)", border: "1px solid rgba(11,26,51,0.16)", borderRadius: 8, padding: "10px 14px", color: "#0B1A33", fontSize: 13, fontFamily: "'Tatra banka Sans V1.0', sans-serif", outline: "none" }} />
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 16, padding: 36, width: 480, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${CYAN}, ${CYAN2})`, borderRadius: "16px 16px 0 0" }} />
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif", marginBottom: 4 }}>Nový meter</div>
        <div style={{ fontSize: 12, color: "#B5C9E8", marginBottom: 28 }}>Definujte metriku pre fakturáciu</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {inp("Názov metra", "name", "napr. PDF Exporty")}
          {inp("Event name", "event_name", "napr. pdf_exported")}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, color: "#B5C9E8", letterSpacing: 1, textTransform: "uppercase" }}>Aggregation</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["COUNT", "SUM"].map(a => (
                <button key={a} onClick={() => set("aggregation", a)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 13,
                  background: form.aggregation === a ? CYAN : "rgba(11,26,51,0.07)",
                  color: form.aggregation === a ? "#fff" : "#C6D6EE",
                  border: `1px solid ${form.aggregation === a ? CYAN : "rgba(11,26,51,0.14)"}`,
                  transition: "all 0.15s",
                }}>{a}</button>
              ))}
            </div>
          </div>
          {inp("Jednotka", "unit", "napr. requests, GB, sekundy")}
          {inp("Limit (voliteľné)", "limit", "napr. 1000000")}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Btn variant="primary" onClick={onClose} disabled={!canCreate}>Vytvoriť meter</Btn>
          <Btn onClick={onClose}>Zrušiť</Btn>
        </div>
      </div>
    </div>
  );
}

function BillingExportView() {
  const [period, setPeriod] = useState("2026-03");
  const [format, setFormat] = useState("CSV");

  const invoiceRows = [
    { merchant: "TechFlow s.r.o.", meter: "API Calls", unit: "requests", usage: 842_300, rate: "0.0015 €", total: "1 263.45 €", status: "ready" },
    { merchant: "StreamCore Ltd", meter: "Data Transfer", unit: "GB", usage: 3_840, rate: "0.012 €", total: "46.08 €", status: "ready" },
    { merchant: "NeuralBit s.r.o.", meter: "AI Inferencie", unit: "calls", usage: 56_100, rate: "0.0014 €", total: "78.54 €", status: "ready" },
    { merchant: "ComputeHub", meter: "CPU Time", unit: "sekundy", usage: 89_400, rate: "0.0008 €", total: "71.52 €", status: "warning" },
    { merchant: "DocuMaster AG", meter: "PDF Exporty", unit: "ks", usage: 14_220, rate: "0.002 €", total: "28.44 €", status: "ready" },
    { merchant: "BookSmart s.r.o.", meter: "Rezervácie", unit: "ks", usage: 2_340, rate: "0.02 €", total: "46.80 €", status: "ready" },
  ];

  const total = "1 534.83 €";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionHeader
        title="Billing Export"
        sub="Podklady pre fakturáciu merchantov"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Btn small>Stiahnuť všetko</Btn>
            <Btn small variant="primary">Exportovať</Btn>
          </div>
        }
      />

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, color: "#B5C9E8", letterSpacing: 1, textTransform: "uppercase" }}>Obdobie</label>
          <input
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{ background: "rgba(11,26,51,0.08)", border: "1px solid rgba(11,26,51,0.16)", borderRadius: 8, padding: "9px 14px", color: "#0B1A33", fontSize: 13, fontFamily: "'Tatra banka Sans V1.0', sans-serif", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <label style={{ fontSize: 11, color: "#B5C9E8", letterSpacing: 1, textTransform: "uppercase" }}>Formát</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["CSV", "JSON", "PDF"].map(f => (
              <button key={f} onClick={() => setFormat(f)} style={{
                padding: "9px 18px", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 12,
                background: format === f ? CYAN : "rgba(11,26,51,0.07)",
                color: format === f ? "#fff" : "#C6D6EE",
                border: `1px solid ${format === f ? CYAN : "rgba(11,26,51,0.14)"}`,
                transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <StatCard label="Celkový objem" value={total} sub="6 merchantov · 6 metrov" accent={CYAN2} icon="💶" />
        <StatCard label="Exporty čakajú" value="6" sub="Pripravené na stiahnutie" icon="📥" />
        <StatCard label="Fakturačné obdobie" value={period} sub="Mesačný billing cyklus" accent="#4a4a4a" icon="📅" />
      </div>

      {/* Table */}
      <div style={{ background: "rgba(11,26,51,0.03)", border: "1px solid rgba(11,26,51,0.12)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 90px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(11,26,51,0.12)", fontSize: 11, color: "#9CB5DB", letterSpacing: 1, textTransform: "uppercase" }}>
          {["Merchant", "Meter", "Jednotka", "Spotreba", "Sadzba", "Celkom", "Export"].map(h => <span key={h}>{h}</span>)}
        </div>
        {invoiceRows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr 90px", gap: 12,
            padding: "14px 20px", borderBottom: "1px solid rgba(11,26,51,0.04)",
            background: i % 2 === 0 ? "transparent" : "rgba(11,26,51,0.02)",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0B1A33" }}>{r.merchant}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: CYAN, fontSize: 11 }}>{r.meter}</span>
            <span style={{ color: "#C6D6EE", fontSize: 12 }}>{r.unit}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#ccc", fontSize: 12 }}>{r.usage.toLocaleString()}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: "#D8E2F2", fontSize: 12 }}>{r.rate}</span>
            <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", color: CYAN2, fontSize: 13, fontWeight: 700 }}>{r.total}</span>
            <button style={{
              background: "transparent", border: `1px solid rgba(0,87,184,0.3)`, color: CYAN,
              borderRadius: 7, padding: "5px 12px", fontSize: 11, cursor: "pointer",
              fontFamily: "'Tatra banka Sans V1.0', sans-serif",
            }}>{format}</button>
          </div>
        ))}
      </div>

      {/* Total footer */}
      <div style={{ background: "rgba(0,87,184,0.04)", border: "1px solid rgba(0,87,184,0.15)", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#D8E2F2" }}>Celková fakturovaná suma za obdobie {period}</span>
        <span style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 24, fontWeight: 700, color: CYAN }}>{total}</span>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "meters", label: "Metre", icon: "⊙" },
  { id: "events", label: "Events", icon: "⚡" },
  { id: "pricing", label: "Ceny", icon: "◎" },
  { id: "alerts", label: "Alerty", icon: "△" },
  { id: "merchants", label: "Merchantia", icon: "▣" },
  { id: "billing", label: "Billing Export", icon: "📥" },
];

export default function App() {
  const [view, setView] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("tb_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("tb_theme", theme);
    document.body.style.background = theme === "dark" ? "#0B1220" : "#F4F8FF";
  }, [theme]);

  return (
    <>
      <style>{`
        @font-face {
          font-family: "Tatra banka Sans V1.0";
          src: local("Tatra banka Sans V1.0"), local("TatraBankaSansV1.0");
          font-style: normal;
          font-weight: 400 800;
          font-display: swap;
        }
        :root {
          --tb-red: #0057B8;
          --tb-red-deep: #1E3A8A;
          --tb-charcoal: #F4F8FF;
          --tb-surface: rgba(11,26,51,0.04);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .theme-shell { transition: filter 0.25s ease, background 0.25s ease, color 0.25s ease; }
        .theme-dark { filter: invert(1) hue-rotate(180deg); }
        body {
          background: radial-gradient(circle at 5% 5%, rgba(0,87,184,0.10), rgba(244,248,255,1) 45%), var(--tb-charcoal);
        }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,87,184,0.2); border-radius: 2px; }
        input::placeholder { color: #AFC3E3 !important; }
      `}</style>
      <div className={`theme-shell ${theme === "dark" ? "theme-dark" : ""}`} style={{ display: "flex", minHeight: "100vh", background: "#F4F8FF", color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>
        
        {/* Sidebar */}
        <div style={{ width: 220, background: "rgba(11,26,51,0.03)", borderRight: "1px solid rgba(11,26,51,0.12)", display: "flex", flexDirection: "column", padding: "28px 0", position: "fixed", height: "100vh", top: 0, left: 0 }}>
          {/* Logo */}
          <div style={{ padding: "0 24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${CYAN}, ${CYAN2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#0B1A33" }}>T</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0B1A33", fontFamily: "'Tatra banka Sans V1.0', sans-serif", lineHeight: 1 }}>tatrapay+</div>
                <div style={{ fontSize: 10, color: "#AFC3E3", letterSpacing: 1, marginTop: 2 }}>USAGE ENGINE</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 9,
                background: view === n.id ? `rgba(0,87,184,0.1)` : "transparent",
                border: `1px solid ${view === n.id ? "rgba(0,87,184,0.2)" : "transparent"}`,
                color: view === n.id ? CYAN : "#9CB5DB", fontSize: 13, cursor: "pointer",
                fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontWeight: view === n.id ? 600 : 400,
                transition: "all 0.15s", textAlign: "left",
              }}>
                <span style={{ fontSize: 14, opacity: 0.8 }}>{n.icon}</span>
                {n.label}
                {n.id === "alerts" && <span style={{ marginLeft: "auto", background: DANGER, color: "#fff", borderRadius: 4, fontSize: 10, padding: "1px 6px", fontFamily: "'Tatra banka Sans V1.0', sans-serif" }}>2</span>}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "20px 16px 0", borderTop: "1px solid rgba(11,26,51,0.08)", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #4a4a4a, #0057B8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>A</div>
              <div>
                <div style={{ fontSize: 12, color: "#ccc" }}>Admin</div>
                <div style={{ fontSize: 10, color: "#9CB5DB" }}>tatrapay+ GW</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ marginLeft: 220, flex: 1, padding: "36px 40px", overflowY: "auto", minHeight: "100vh" }}>
          {/* Topbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 36, gap: 12 }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                background: "transparent",
                border: "1px solid rgba(11,26,51,0.16)",
                borderRadius: 8,
                padding: "7px 12px",
                color: "#0B1A33",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'Tatra banka Sans V1.0', sans-serif",
              }}
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,87,184,0.08)", border: "1px solid rgba(0,87,184,0.2)", borderRadius: 8, padding: "7px 14px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: CYAN2, boxShadow: `0 0 8px ${CYAN2}` }} />
              <span style={{ fontSize: 12, color: CYAN2 }}>Systém online</span>
            </div>
            <div style={{ fontFamily: "'Tatra banka Sans V1.0', sans-serif", fontSize: 11, color: "#AFC3E3" }}>API v2.4.1</div>
          </div>

          {view === "dashboard" && <Dashboard />}
          {view === "meters" && <MetersView onNewMeter={() => setShowModal(true)} />}
          {view === "events" && <EventsView />}
          {view === "pricing" && <PricingView />}
          {view === "alerts" && <AlertsView />}
          {view === "merchants" && <MerchantsView />}
          {view === "billing" && <BillingExportView />}
        </div>
      </div>

      {showModal && <NewMeterModal onClose={() => setShowModal(false)} />}
    </>
  );
}
