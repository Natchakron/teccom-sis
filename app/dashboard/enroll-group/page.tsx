"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export default function BulkEnrollmentPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    startCode: "",
    endCode: "",
    subjectId: "",
    term: "1/2569"
  });

  useEffect(() => {
    // โหลดรายวิชามาให้เลือก
    fetch("/api/subjects")
      .then(res => res.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/enrollments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 relative z-10">
          <Users size={36} /> ลงทะเบียนเรียนแบบกลุ่ม
        </h1>
        <p className="text-indigo-100 mt-2 text-lg relative z-10">
          เพิ่มรายวิชาให้นักเรียนทั้งห้องได้ในคลิกเดียว เพียงระบุช่วงรหัสประจำตัว
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {message && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            <CheckCircle className={message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'} />
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">รหัสนักเรียนเริ่มต้น</label>
              <input 
                type="text" 
                required 
                placeholder="เช่น 66302040001" 
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.startCode}
                onChange={e => setFormData({...formData, startCode: e.target.value})}
              />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="hidden md:flex absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-sm border border-slate-100 z-10">
                <ArrowRight className="text-slate-400" size={20} />
              </div>
              <label className="block text-sm font-bold text-slate-700 mb-2">รหัสนักเรียนสิ้นสุด</label>
              <input 
                type="text" 
                required 
                placeholder="เช่น 66302040020" 
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.endCode}
                onChange={e => setFormData({...formData, endCode: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><BookOpen size={16}/> เลือกรายวิชา</label>
              <select 
                required 
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.subjectId}
                onChange={e => setFormData({...formData, subjectId: e.target.value})}
              >
                <option value="">-- กรุณาเลือกรายวิชา --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subjectCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ภาคเรียน/ปีการศึกษา</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.term}
                onChange={e => setFormData({...formData, term: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              {loading ? "กำลังดำเนินการ..." : "ลงทะเบียนให้ทั้งกลุ่ม"} <ArrowRight size={20}/>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}