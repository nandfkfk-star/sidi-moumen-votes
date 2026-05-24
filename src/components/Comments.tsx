import { useEffect, useState } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { MessageCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Comment = { id: string; name: string; text: string; ts: number };

export default function Comments() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [list, setList] = useState<Comment[]>([]);

  useEffect(() => {
    const unsub = onValue(ref(db, "comments"), (snap) => {
      const v = snap.val() || {};
      const arr: Comment[] = Object.entries(v).map(([id, c]: [string, any]) => ({
        id, name: c.name, text: c.text, ts: c.ts || 0,
      }));
      arr.sort((a, b) => b.ts - a.ts);
      setList(arr);
    });
    return () => unsub();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    await push(ref(db, "comments"), {
      name: name.trim().slice(0, 40),
      text: text.trim().slice(0, 300),
      ts: serverTimestamp(),
    });
    setText("");
  };

  return (
    <section className="rounded-3xl bg-card border-2 border-primary/15 shadow-[var(--shadow-soft)] p-6">
      <div className="flex items-center gap-2 mb-5 justify-end">
        <h2 className="text-xl font-bold">💬 تعليقات الزوار</h2>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: "var(--gradient-publish-btn)" }}
        >
          <MessageCircle size={20} />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3 mb-6">
        <Input
          placeholder="✍️ اسمك"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="h-12 rounded-full border-2 border-primary/15 bg-card pr-5"
        />
        <Textarea
          placeholder="💭 اكتب تعليقك..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          rows={2}
          className="rounded-3xl border-2 border-primary/15 bg-card px-5 py-3 resize-none"
        />
        <button
          type="submit"
          className="w-full h-12 rounded-full text-white font-bold shadow-md hover:scale-[1.01] active:scale-100 transition flex items-center justify-center gap-2"
          style={{ background: "var(--gradient-publish-btn)" }}
        >
          <Sparkles size={18} /> نشر التعليق
        </button>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {list.length === 0 && (
            <p className="text-muted-foreground text-center py-4">🌟 كن أول من يعلّق</p>
          )}
          {list.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-2xl bg-secondary/40 border"
            >
              <div className="font-bold text-primary text-sm mb-1">{c.name}</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
