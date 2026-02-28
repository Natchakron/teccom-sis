"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, PlusCircle, X, BookOpen, Clock, MapPin, Users, CheckCircle } from "lucide-react";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // 🎛️ ควบคุมว่าเปิดฟอร์มไหนอยู่
  const [activeForm, setActiveForm] = useState<'none' | 'schedule' | 'enroll'>('none');
  
  // 📝 ข้อมูลฟอร์มตารางสอน
  const [formData, setFormData] = useState({ 
    subjectId: "", dayOfWeek: "วันจันทร์", 
    startTime: "08:30", endTime: "10:30", room: "ห้องปฏิบัติการคอมพิวเตอร์ 1" 
  });
  const [loading, setLoading] = useState(false);

  // 👥 ข้อมูลฟอร์มเอานักเรียนเข้าวิชา (Bulk Enroll)
  const [bulkData, setBulkData] = useState({ startCode: "", endCode: "", subjectId: "", term: "1/2569" });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchData = async () => {
    const [schedRes, subjRes] = await Promise.all([
      fetch("/api/schedules"),
      fetch("/api/subjects")
    ]);
    setSchedules(await schedRes.json());
    setSubjects(await subjRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  // 1. ฟังก์ชันเซฟตารางสอน
  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setActiveForm('none');
      fetchData();
    }
    setLoading(false);
  };

  // 2. ฟังก์ชันจับนักเรียนเข้าวิชาเรียน
  const handleBulkEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkMessage(null);
    try {
      const res = await fetch("/api/enrollments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkData)
      });
      const data = await res.json();
      if (res.ok) {
        setBulkMessage({ type: 'success', text: data.message });
        setTimeout(() => { setActiveForm('none'); setBulkMessage(null); }, 4000);
      } else {
        setBulkMessage({ type: 'error', text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      setBulkMessage({ type: 'error', text: "เชื่อมต่อล้มเหลว" });
    }
    setBulkLoading(false);
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
          <p className="text-slate-500 font-medium mt-1 print:hidden">จัดตารางสอนของอาจารย์และห้องเรียน</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
          {/* ปุ่มเอานักเรียนเข้าวิชา */}
          <button
            onClick={() => setActiveForm(activeForm === 'enroll' ? 'none' : 'enroll')}
            className={`${activeForm === 'enroll' ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all print:hidden`}
          >
            {activeForm === 'enroll' ? <X size={20} /> : <Users size={20} />}
            {activeForm === 'enroll' ? "ปิดฟอร์ม" : "จัดนักเรียนเข้าวิชา"}
          </button>

          {/* ปุ่มเพิ่มตารางเรียน */}
          <button
            onClick={() => setActiveForm(activeForm === 'schedule' ? 'none' : 'schedule')}
            className={`${activeForm === 'schedule' ? 'bg-slate-700' : 'bg-purple-600 hover:bg-purple-700'} text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all print:hidden`}
          >
            {activeForm === 'schedule' ? <X size={20} /> : <PlusCircle size={20} />}
            {activeForm === 'schedule' ? "ปิดฟอร์ม" : "เพิ่มตารางเรียน"}
          </button>

          {/* ปุ่มพิมพ์ตารางเรียน */}
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-all print:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            พิมพ์ตารางเรียน
          </button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {/* ================= ฟอร์ม 1: จัดนักเรียนเข้าวิชา ================= */}
        {activeForm === 'enroll' && (
          <motion.div key="enroll" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden print:hidden">
            <div className="bg-blue-50 p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-blue-100 mb-8">
              <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2"><Users size={20}/> นำนักเรียนเข้าศึกษารายวิชานี้ (ทั้งกลุ่ม)</h2>
              
              {bulkMessage && (
                <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${bulkMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  <CheckCircle size={20} /> <span className="font-bold">{bulkMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleBulkEnroll} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัสเริ่มต้น</label>
                  <input type="text" required placeholder="เช่น 66302040001" value={bulkData.startCode} onChange={e => setBulkData({...bulkData, startCode: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัสสิ้นสุด</label>
                  <input type="text" required placeholder="เช่น 66302040020" value={bulkData.endCode} onChange={e => setBulkData({...bulkData, endCode: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><BookOpen size={16}/> เลือกรายวิชา</label>
                  <select required value={bulkData.subjectId} onChange={e => setBulkData({...bulkData, subjectId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- เลือกวิชาที่จะให้นักเรียนกลุ่มนี้ --</option>
                    {Array.isArray(subjects) && subjects.map(s => <option key={s.id} value={s.id}>{s.subjectCode} - {s.name}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">เทอม</label>
                  <input type="text" required value={bulkData.term} onChange={e => setBulkData({...bulkData, term: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                </div>
                <div className="lg:col-span-5 flex justify-end mt-2">
                  <button type="submit" disabled={bulkLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/30">
                    {bulkLoading ? "กำลังประมวลผล..." : "ยืนยันนำนักเรียนเข้าวิชา"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ================= ฟอร์ม 2: สร้างตารางสอน ================= */}
        {activeForm === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden print:hidden">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
              <form onSubmit={handleSubmitSchedule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= ส่วนหัวที่จะแสดงเฉพาะตอนปริ้นเท่านั้น ================= */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-black mb-1">TECCOM SIS - ตารางเรียน</h1>
        <p className="text-lg text-slate-700 font-medium">วิทยาลัยเทคนิคชัยนาท แผนกเทคโนโลยีคอมพิวเตอร์</p>
        <p className="text-sm mt-2 text-slate-500">พิมพ์เมื่อวันที่: {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* ================= ตารางแสดงผลที่สร้างไว้ ================= */}
      {/* 🚀 ปรับ print:grid-cols-2 เพื่อให้พอดีกับกระดาษ A4 แนวตั้ง */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {Array.isArray(schedules) && schedules.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-1 transition-transform print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold print:bg-slate-100 print:text-slate-800">{item.dayOfWeek}</span>
              <span className="text-slate-400 text-sm flex items-center gap-1 print:text-slate-700"><Clock size={14}/> {item.startTime} - {item.endTime}</span>
            </div>
            <h3 className="font-bold text-slate-800 text-lg print:text-black">{item.subject?.name}</h3>
            <p className="text-slate-500 text-sm mb-4 print:text-slate-600">รหัสวิชา: {item.subject?.subjectCode}</p>
            <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2 text-slate-600 text-sm border border-slate-100 print:bg-white print:border-slate-300 print:text-slate-800">
              <MapPin size={16} className="text-rose-500 print:text-slate-600" /> ห้อง: <span className="font-semibold">{item.room}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}