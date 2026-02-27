"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Search, PlusCircle, X, BookOpen, Clock, MapPin } from "lucide-react";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({ 
    subjectId: "", dayOfWeek: "วันจันทร์", 
    startTime: "08:30", endTime: "10:30", room: "ห้องปฏิบัติการคอมพิวเตอร์ 1" 
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [schedRes, subjRes] = await Promise.all([
      fetch("/api/schedules"),
      fetch("/api/subjects")
    ]);
    setSchedules(await schedRes.json());
    setSubjects(await subjRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsFormOpen(false);
      fetchData();
    }
    setLoading(false);
  };

  const days = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <CalendarDays className="text-purple-500" size={36} />
            จัดการตารางเรียน
          </h1>
          <p className="text-slate-500 font-medium mt-1">จัดตารางสอนของอาจารย์และห้องเรียน</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all"
        >
          {isFormOpen ? <X size={20} /> : <PlusCircle size={20} />}
          {isFormOpen ? "ปิดฟอร์ม" : "เพิ่มตารางเรียน"}
        </motion.button>
      </div>

      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><BookOpen size={16}/> รายวิชา</label>
              <select required value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="">-- เลือกวิชา --</option>
                {Array.isArray(subjects) && subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.subjectCode} - {s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">วัน</label>
              <select value={formData.dayOfWeek} onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                {days.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            
            {/* ขยายช่องนี้ให้กินพื้นที่ 2 คอลัมน์ จะได้ไม่ซ้อนกัน */}
            <div className="md:col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">เวลา (เริ่ม - จบ)</label>
              <div className="flex items-center gap-2">
                <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                <span className="text-slate-400 font-bold">-</span>
                <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">ห้องเรียน</label>
              <input type="text" required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            
            <div className="md:col-span-2 lg:col-span-6 flex justify-end mt-2">
              <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                {loading ? "กำลังบันทึก..." : "บันทึกตารางสอน"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ตารางแสดงผล */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(schedules) && schedules.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{item.dayOfWeek}</span>
              <span className="text-slate-400 text-sm flex items-center gap-1"><Clock size={14}/> {item.startTime} - {item.endTime}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{item.subject?.name}</h3>
            <p className="text-slate-500 text-sm mb-4">รหัสวิชา: {item.subject?.subjectCode}</p>
            <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2 text-slate-600 text-sm border border-slate-100">
              <MapPin size={16} className="text-rose-500" /> ห้อง: <span className="font-semibold">{item.room}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}