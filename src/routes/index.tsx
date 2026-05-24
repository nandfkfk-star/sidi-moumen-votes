import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
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
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header
        className="relative overflow-hidden text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <Link
            to="/admin"
            className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 backdrop-blur transition"
          >
            <Settings size={14} /> الإدارة
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-center leading-tight"
          >
            صوّت لأفضل حي في سيدي مومن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mt-4 text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            شارك في تحديد الترتيب اللحظي لأحياء سيدي مومن — صوت واحد لكل زائر.
          </motion.p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <Leaderboard />
        <Comments />
      </main>

      <footer className="text-center py-8 text-sm text-muted-foreground border-t mt-10">
        © {new Date().getFullYear()} ترتيب أحياء سيدي مومن
      </footer>
    </div>
  );
}
