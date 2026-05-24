import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { motion } from "framer-motion";
import { Shield, Sparkles, Flame, MousePointerClick } from "lucide-react";
import { db } from "@/lib/firebase";
import { MSLogo } from "@/components/MSLogo";
import Leaderboard from "@/components/Leaderboard";
import Comments from "@/components/Comments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ترتيب أحياء سيدي مومن — صوّت لأفضل حي" },
      { name: "description", content: "صوّت لأفضل حي في سيدي مومن وشاهد الترتيب اللحظي لجميع الأحياء." },
      { property: "og:title", content: "ترتيب أحياء سيدي مومن" },
      { property: "og:description", content: "صوّت لأفضل حي في سيدي مومن وشاهد الترتيب اللحظي." },
    ],
  }),
  component: Index,
});

function Index() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const unsub = onValue(ref(db, "neighborhoods"), (snap) => {
      const v = snap.val() || {};
      const sum = Object.values(v).reduce(
        (s: number, n: any) => s + (n?.votes || 0),
        0,
      );
      setTotal(sum);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Top brand bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-card/85 border-b border-primary/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs md:text-sm bg-[oklch(0.92_0.06_220)] text-primary font-bold rounded-full px-3 py-1.5 hover:scale-105 transition"
          >
            <Shield size={14} /> الإدارة
          </Link>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <h1 className="font-extrabold text-primary text-sm md:text-base leading-tight">
                ترتيب أحياء سيدي مومن
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Sparkles size={10} /> تصويت لحظي ممتع
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 ring-2 ring-primary/30 rounded-2xl">
              <MSLogo className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1px, transparent 1.5px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-14 md:pt-14 md:pb-20 relative text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180 }}
            className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-5 rounded-[2rem] shadow-[var(--shadow-elegant)] bg-white p-2"
          >
            <MSLogo className="w-full h-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-md"
            style={{ background: "var(--gradient-vote-btn)" }}
          >
            <MousePointerClick size={14} />
            مباشر • {total} صوت
            <Flame size={14} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold leading-tight"
            style={{ color: "var(--brand-blue)" }}
          >
            صوّت لأفضل حي في{" "}
            <span style={{ color: "var(--brand-purple)" }}>سيدي</span>{" "}
            <span style={{ color: "var(--brand-blue)" }}>مومن</span> 🏘️
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base md:text-lg text-muted-foreground"
          >
            راك غا تفرّج ولا غادي تصوّت؟! 🔥
          </motion.p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10 -mt-6 relative">
        <Leaderboard />
        <Comments />
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground border-t mt-10">
        © {new Date().getFullYear()} ترتيب أحياء سيدي مومن
      </footer>
    </div>
  );
}
