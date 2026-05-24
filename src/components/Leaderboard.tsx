import { useEffect, useMemo, useState } from "react";
import { ref, onValue, runTransaction, set, get } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Check, BarChart3, Star } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import { db, INITIAL_NEIGHBORHOODS } from "@/lib/firebase";
import { Input } from "@/components/ui/input";

type Neighborhood = { id: string; name: string; votes: number };

const STORAGE_KEY = "sm_voted_neighborhoods";

// Cycle of vivid rank-circle colors (like the screenshot)
const RANK_COLORS = [
  "oklch(0.78 0.16 70)",   // orange (gold-ish)
  "oklch(0.7 0.18 35)",    // orange
  "oklch(0.7 0.17 150)",   // green
  "oklch(0.6 0.2 260)",    // blue
  "oklch(0.72 0.17 150)",  // green
  "oklch(0.7 0.17 150)",
  "oklch(0.62 0.2 260)",
  "oklch(0.7 0.18 35)",
  "oklch(0.72 0.17 150)",
  "oklch(0.6 0.2 260)",
];
const rankColor = (i: number) => RANK_COLORS[i % RANK_COLORS.length];

function useVotedSet() {
  const [voted, setVoted] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVoted(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const add = (id: string) => {
    setVoted((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };
  return { voted, add };
}

export default function Leaderboard() {
  const [items, setItems] = useState<Neighborhood[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { voted, add } = useVotedSet();

  useEffect(() => {
    const seed = async () => {
      const snap = await get(ref(db, "neighborhoods"));
      if (!snap.exists()) {
        const obj: Record<string, { name: string; votes: number }> = {};
        INITIAL_NEIGHBORHOODS.forEach((name, i) => {
          obj[`n${i}`] = { name, votes: 0 };
        });
        await set(ref(db, "neighborhoods"), obj);
      }
    };
    seed().catch(console.error);
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db, "neighborhoods"), (snap) => {
      const data = snap.val() || {};
      const list: Neighborhood[] = Object.entries(data).map(
        ([id, v]: [string, any]) => ({ id, name: v.name, votes: v.votes || 0 }),
      );
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.votes - a.votes),
    [items],
  );
  const totalVotes = useMemo(
    () => sorted.reduce((s, n) => s + n.votes, 0),
    [sorted],
  );
  const filtered = useMemo(
    () => sorted.filter((n) => n.name.includes(query.trim())),
    [sorted, query],
  );

  const vote = async (id: string) => {
    if (voted.has(id)) return;
    add(id);
    await runTransaction(ref(db, `neighborhoods/${id}/votes`), (cur) => (cur || 0) + 1);
  };

  const top3 = sorted.slice(0, 3);
  const chartData = sorted.slice(0, 10).map((n) => ({ name: n.name, votes: n.votes }));

  // Podium order in display: 3, 1, 2 (left -> middle tallest -> right)
  const podiumDisplay = [
    { n: top3[2], rank: 3, h: 130, grad: "var(--gradient-podium-3)", medal: "🥉" },
    { n: top3[0], rank: 1, h: 180, grad: "var(--gradient-podium-1)", medal: "🥇" },
    { n: top3[1], rank: 2, h: 150, grad: "var(--gradient-podium-2)", medal: "🥈" },
  ];

  return (
    <div className="space-y-10">
      {/* Podium */}
      <section>
        <div className="grid grid-cols-3 gap-3 items-end">
          {podiumDisplay.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-3xl mb-1 drop-shadow-sm">{p.medal}</div>
              {p.n ? (
                <>
                  <div className="text-center mb-2">
                    <p className="font-bold text-sm md:text-base">{p.n.name}</p>
                    <p className="text-xs text-primary font-semibold">{p.n.votes} صوت</p>
                  </div>
                  <div
                    className="w-full rounded-t-2xl shadow-[var(--shadow-podium)] flex items-start justify-center pt-3 text-white font-extrabold text-lg"
                    style={{ background: p.grad, height: p.h }}
                  >
                    #{p.rank}
                  </div>
                </>
              ) : (
                <div
                  className="w-full rounded-t-2xl bg-muted flex items-start justify-center pt-3 text-muted-foreground font-extrabold text-lg"
                  style={{ height: p.h }}
                >
                  #{p.rank}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
        <Input
          placeholder="🔎 ابحث عن حي..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-12 h-14 rounded-full bg-card border-2 border-primary/20 shadow-[var(--shadow-soft)] text-base"
        />
      </div>

      {/* Leaderboard table card */}
      <section className="rounded-3xl bg-card border-2 border-primary/15 shadow-[var(--shadow-soft)] overflow-hidden">
        <div
          className="px-4 py-4 text-white grid grid-cols-[60px_1fr_100px_110px] gap-2 font-bold text-sm md:text-base"
          style={{ background: "var(--gradient-table-head)" }}
        >
          <div>#</div>
          <div>🏘️ الحي</div>
          <div className="text-center">❤️ الأصوات</div>
          <div className="text-center">تصويت</div>
        </div>

        <div className="divide-y">
          <AnimatePresence>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">لا توجد نتائج</div>
            ) : (
              filtered.map((n) => {
                const rank = sorted.findIndex((x) => x.id === n.id) + 1;
                const hasVoted = voted.has(n.id);
                const isTop = rank <= 3;
                const color = rankColor(rank - 1);
                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 py-3 grid grid-cols-[60px_1fr_100px_110px] gap-2 items-center hover:bg-secondary/30 transition-colors"
                  >
                    <div>
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold shadow-md ring-2 ring-white"
                        style={{ backgroundColor: color }}
                      >
                        {rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-base md:text-lg">
                      <span>{n.name}</span>
                      {isTop && <Star size={16} className="text-[var(--gold)] fill-[var(--gold)]" />}
                    </div>
                    <div className="text-center font-extrabold text-primary text-lg">
                      {n.votes}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => vote(n.id)}
                        disabled={hasVoted}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-60 disabled:hover:scale-100"
                        style={{ background: "var(--gradient-vote-btn)" }}
                      >
                        {hasVoted ? (
                          <>
                            <Check size={14} /> تم
                          </>
                        ) : (
                          <>
                            <Heart size={14} className="fill-white" /> صوّت
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
        {totalVotes > 0 && (
          <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t bg-secondary/20">
            مجموع الأصوات: <span className="font-bold text-primary">{totalVotes}</span>
          </div>
        )}
      </section>

      {/* Chart */}
      <section className="rounded-3xl bg-card border-2 border-[var(--gold)]/30 shadow-[var(--shadow-soft)] p-6">
        <div className="flex items-center gap-2 mb-4 justify-end">
          <h2 className="text-xl font-bold">📊 إحصائيات أعلى 10 أحياء</h2>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: "var(--gradient-bar)" }}
          >
            <BarChart3 size={20} />
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 50 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.22 320)" />
                  <stop offset="100%" stopColor="oklch(0.72 0.2 35)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="oklch(0.9 0.02 270)" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-40}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 12, fill: "oklch(0.4 0.04 270)" }}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="votes" radius={[20, 20, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="url(#barGrad)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
