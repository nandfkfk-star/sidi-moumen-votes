import { useEffect, useState } from "react";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { MessageCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <section className="rounded-2xl bg-card border shadow-[var(--shadow-soft)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-primary" />
        <h2 className="text-2xl font-bold">تعليقات الزوار</h2>
      </div>

      <form onSubmit={submit} className="space-y-3 mb-6">
        <Input
          placeholder="اسمك"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
        <Textarea
          placeholder="اكتب تعليقك..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          rows={3}
        />
        <Button type="submit" className="gap-2">
          <Send size={16} /> إرسال
        </Button>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {list.length === 0 && (
            <p className="text-muted-foreground text-center py-6">لا توجد تعليقات بعد. كن أول من يعلق!</p>
          )}
          {list.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-secondary/40 border"
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
