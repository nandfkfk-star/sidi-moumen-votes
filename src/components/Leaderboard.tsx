import { useEffect, useMemo, useState } from "react";
import { ref, onValue, runTransaction, set, get } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Search, ThumbsUp, Check, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { db, INITIAL_NEIGHBORHOODS } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Neighborhood = { id: string; name: string; votes: number };

const STORAGE_KEY = "sm_voted_neighborhoods";

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

  // Seed initial data once
  useEffect(() => {
    const seed = async () => {
      const snap = await get(ref(db, "neighborhoods"));
      if (!snap.exists()) {
        const obj: Record<string, { name: string; votes: number }> = {};
        INITIAL_NEIGHBORHOODS.forEach((name, i) => {
          const id = `n${i}`;
          obj[id] = { name, votes: 0 };
        });
        await set(ref(db, "neighborhoods"), obj);
      }
    };
    seed().catch(console.error);
  }, []);

  // Live subscription
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

  return (
    <div className="space-y-10">
      {/* Top 3 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-[var(--gold)]" />
          <h2 className="text-2xl font-bold">أفضل 3 أحياء</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 0, 2].map((order) => {
            const n = top3[order];
            if (!n) return <div key={order} />;
            const medal = order === 0 ? "gold" : order === 1 ? "silver" : "bronze";
            const colors: Record<string, string> = {
              gold: "var(--gold)", silver: "var(--silver)", bronze: "var(--bronze)",
            };
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order * 0.1 }}
                className="rounded-2xl p-6 bg-card shadow-[var(--shadow-soft)] border text-center relative overflow-hidden"
                style={{ background: "var(--gradient-card)" }}
              >
                <div
                  className="absolute top-0 inset-x-0 h-1.5"
                  style={{ backgroundColor: colors[medal] }}
                />
                <Trophy
                  className="mx-auto mb-3"
                  size={order === 0 ? 48 : 36}
                  style={{ color: colors[medal] }}
                />
                <div className="text-sm text-muted-foreground mb-1">#{order + 1}</div>
                <h3 className="text-xl font-bold mb-1">{n.name}</h3>
                <p className="text-2xl font-extrabold text-primary">{n.votes}</p>
                <p className="text-xs text-muted-foreground">صوت</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Search + Table */}
      <section className="rounded-2xl bg-card border shadow-[var(--shadow-soft)] overflow-hidden">
        <div className="p-4 border-b bg-secondary/40">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="ابحث عن حي..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 h-11 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-secondary/30 text-sm">
              <tr>
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold">الحي</th>
                <th className="p-3 font-semibold">الأصوات</th>
                <th className="p-3 font-semibold">النسبة</th>
                <th className="p-3 font-semibold">التصويت</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
                ) : (
                  filtered.map((n) => {
                    const rank = sorted.findIndex((x) => x.id === n.id) + 1;
                    const pct = totalVotes ? (n.votes / totalVotes) * 100 : 0;
                    const hasVoted = voted.has(n.id);
                    const isTop = rank <= 3;
                    return (
                      <motion.tr
                        key={n.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-secondary/20 transition-colors"
                      >
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${
                              isTop ? "text-white" : "bg-secondary text-foreground"
                            }`}
                            style={isTop ? {
                              backgroundColor: rank === 1 ? "var(--gold)" :
                                rank === 2 ? "var(--silver)" : "var(--bronze)",
                            } : {}}
                          >
                            {rank}
                          </span>
                        </td>
                        <td className="p-3 font-semibold">{n.name}</td>
                        <td className="p-3 font-bold text-primary">{n.votes}</td>
                        <td className="p-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            onClick={() => vote(n.id)}
                            disabled={hasVoted}
                            className="gap-1"
                          >
                            {hasVoted ? <><Check size={16} /> تم</> : <><ThumbsUp size={16} /> تصويت</>}
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart */}
      <section className="rounded-2xl bg-card border shadow-[var(--shadow-soft)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-primary" />
          <h2 className="text-2xl font-bold">إحصائيات أعلى 10 أحياء</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 12, fill: "oklch(0.4 0.04 250)" }}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--gold)" : i === 1 ? "var(--silver)" : i === 2 ? "var(--bronze)" : "var(--primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
