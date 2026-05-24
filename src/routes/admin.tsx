import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ref, onValue, push, remove, update, set } from "firebase/database";
import { ArrowRight, Pencil, Plus, Trash2, X, Check, RotateCcw } from "lucide-react";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — ترتيب أحياء سيدي مومن" },
      { name: "description", content: "إدارة قائمة أحياء سيدي مومن: إضافة وتعديل وحذف." },
    ],
  }),
  component: Admin,
});

const ADMIN_PASS = "abdrhman2006";

type Row = { id: string; name: string; votes: number };

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("sm_admin") === "1") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const unsub = onValue(ref(db, "neighborhoods"), (snap) => {
      const v = snap.val() || {};
      const arr: Row[] = Object.entries(v).map(([id, x]: [string, any]) => ({
        id, name: x.name, votes: x.votes || 0,
      }));
      arr.sort((a, b) => b.votes - a.votes);
      setRows(arr);
    });
    return () => unsub();
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("sm_admin", "1");
      setAuthed(true);
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const add = async () => {
    if (!newName.trim()) return;
    await push(ref(db, "neighborhoods"), { name: newName.trim(), votes: 0 });
    setNewName("");
  };

  const del = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الحي؟")) return;
    await remove(ref(db, `neighborhoods/${id}`));
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await update(ref(db, `neighborhoods/${id}`), { name: editName.trim() });
    setEditing(null);
  };

  const resetVotes = async (id: string) => {
    if (!confirm("إعادة تعيين أصوات هذا الحي إلى 0؟")) return;
    await set(ref(db, `neighborhoods/${id}/votes`), 0);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30">
        <form onSubmit={login} className="bg-card border rounded-2xl shadow-[var(--shadow-soft)] p-8 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">لوحة الإدارة</h1>
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <Button type="submit" className="w-full">دخول</Button>
          <Link to="/" className="block text-center text-sm text-primary hover:underline">
            العودة للموقع
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة إدارة الأحياء</h1>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            العودة للموقع <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border rounded-2xl p-4 shadow-[var(--shadow-soft)]">
          <h2 className="font-bold mb-3">إضافة حي جديد</h2>
          <div className="flex gap-2">
            <Input
              placeholder="اسم الحي"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={add} className="gap-1 shrink-0">
              <Plus size={16} /> إضافة
            </Button>
          </div>
        </div>

        <div className="bg-card border rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-secondary/50 text-sm">
              <tr>
                <th className="p-3">الحي</th>
                <th className="p-3">الأصوات</th>
                <th className="p-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    {editing === r.id ? (
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      <span className="font-semibold">{r.name}</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-primary">{r.votes}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {editing === r.id ? (
                        <>
                          <Button size="sm" onClick={() => saveEdit(r.id)} className="gap-1">
                            <Check size={14} /> حفظ
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="gap-1">
                            <X size={14} /> إلغاء
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setEditing(r.id); setEditName(r.name); }} className="gap-1">
                            <Pencil size={14} /> تعديل
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => resetVotes(r.id)} className="gap-1">
                            <RotateCcw size={14} /> تصفير
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => del(r.id)} className="gap-1">
                            <Trash2 size={14} /> حذف
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">لا توجد أحياء</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
