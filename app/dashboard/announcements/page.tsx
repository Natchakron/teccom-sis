"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, PlusCircle, Trash2, AlertTriangle, Info, AlertOctagon } from "lucide-react";

export default function AnnouncementsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", type: "INFO" });
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    const res = await fetch("/api/announcements");
    const data = await res.json();
    if (Array.isArray(data)) setNews(data);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ title: "", content: "", type: "INFO" });
      setIsFormOpen(false);
      fetchNews();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบประกาศนี้ใช่หรือไม่?")) return;
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    fetchNews();
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Megaphone className="text-sky-500" size={36} />
            ระบบประกาศข่าวสาร
          </h1>
          <p className="text-slate-500 font-medium mt-1">แจ้งข่าวสาร กิจกรรม และประกาศสำคัญให้นักศึกษาทราบ</p>
        </motion.div>

        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-500/30 transition-all">
          <PlusCircle size={20} /> {isFormOpen ? "ปิดฟอร์ม" : "สร้างประกาศใหม่"}
        </button>
      </div>

      {isFormOpen && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อประกาศ</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" placeholder="เช่น แจ้งงดคลาสเรียน, กำหนดการสอบ..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียด</label>
            <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-sky-500 outline-none min-h-[100px]" placeholder="พิมพ์รายละเอียดที่นี่..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ความสำคัญของประกาศ</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <input type="radio" name="type" value="INFO" checked={formData.type === "INFO"} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                <span className="text-blue-700 font-medium flex items-center gap-1"><Info size={16}/> ทั่วไป</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <input type="radio" name="type" value="WARNING" checked={formData.type === "WARNING"} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                <span className="text-amber-700 font-medium flex items-center gap-1"><AlertTriangle size={16}/> สำคัญ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-rose-50 px-4 py-2 rounded-lg border border-rose-200">
                <input type="radio" name="type" value="URGENT" checked={formData.type === "URGENT"} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                <span className="text-rose-700 font-medium flex items-center gap-1"><AlertOctagon size={16}/> ด่วนมาก</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50">
              {loading ? "กำลังบันทึก..." : "โพสต์ประกาศ"}
            </button>
          </div>
        </motion.form>
      )}

      {/* รายการประกาศ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">ยังไม่มีประกาศข่าวสาร</div>
        ) : (
          news.map((item) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col relative">
              <div className={`h-2 w-full ${item.type === 'URGENT' ? 'bg-rose-500' : item.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-max
                    ${item.type === 'URGENT' ? 'bg-rose-100 text-rose-700' : item.type === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.type === 'URGENT' ? <AlertOctagon size={12}/> : item.type === 'WARNING' ? <AlertTriangle size={12}/> : <Info size={12}/>}
                    {item.type === 'URGENT' ? 'ด่วนมาก' : item.type === 'WARNING' ? 'สำคัญ' : 'แจ้งเตือน'}
                  </span>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
              <div className="bg-slate-50 px-5 py-3 text-xs text-slate-400 border-t border-slate-100 font-medium">
                โพสต์เมื่อ: {new Date(item.createdAt).toLocaleString('th-TH')}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}