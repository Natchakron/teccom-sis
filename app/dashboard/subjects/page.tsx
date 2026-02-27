"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, BookPlus, X } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ subjectCode: "", name: "", credit: "", teacherId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ดึงข้อมูลวิชาและรายชื่ออาจารย์พร้อมกันตอนเปิดหน้าเว็บ
  const fetchData = async () => {
    const [subjectsRes, teachersRes] = await Promise.all([
      fetch("/api/subjects"),
      fetch("/api/teachers")
    ]);
    
    const subjectsData = await subjectsRes.json();
    const teachersData = await teachersRes.json();
    
    if (Array.isArray(subjectsData)) setSubjects(subjectsData);
    if (Array.isArray(teachersData)) setTeachers(teachersData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId) {
      setError("กรุณาเลือกอาจารย์ผู้สอน");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ subjectCode: "", name: "", credit: "", teacherId: "" });
      setIsFormOpen(false);
      fetchData(); // โหลดข้อมูลใหม่มาแสดง
    } else {
      const data = await res.json();
      setError(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <BookOpen className="text-orange-500" size={36} />
            จัดการรายวิชา
          </h1>
          <p className="text-slate-500 font-medium mt-1">เพิ่มและจัดสรรวิชาเรียน แผนกเทคโนโลยีคอมพิวเตอร์</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
        >
          {isFormOpen ? <X size={20} /> : <BookPlus size={20} />}
          {isFormOpen ? "ปิดฟอร์ม" : "เพิ่มรายวิชาใหม่"}
        </motion.button>
      </div>

      {/* ฟอร์มเพิ่มรายวิชา */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">เปิดรายวิชาใหม่</h2>
          {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสวิชา</label>
              <input type="text" required value={formData.subjectCode} onChange={(e) => setFormData({...formData, subjectCode: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="เช่น 30204-2001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อวิชา</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="เช่น การเขียนโปรแกรมบนอินเทอร์เน็ต" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หน่วยกิต</label>
              <input type="number" min="1" max="6" required value={formData.credit} onChange={(e) => setFormData({...formData, credit: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="เช่น 3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">อาจารย์ผู้สอน</label>
              <select required value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-slate-700">
                <option value="">-- เลือกอาจารย์ --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    อ. {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                {loading ? "กำลังบันทึก..." : "บันทึกรายวิชา"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ตารางแสดงรายวิชา */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหารายวิชา..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            จำนวนทั้งหมด {subjects.length} วิชา
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">รหัสวิชา</th>
                <th className="py-4 px-6 font-semibold">ชื่อวิชา</th>
                <th className="py-4 px-6 font-semibold text-center">หน่วยกิต</th>
                <th className="py-4 px-6 font-semibold">อาจารย์ผู้สอน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">ยังไม่มีข้อมูลรายวิชาในระบบ</td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-800">{subject.subjectCode}</td>
                    <td className="py-4 px-6 text-slate-600">{subject.name}</td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">{subject.credit}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {subject.teacher ? `อ. ${subject.teacher.firstName} ${subject.teacher.lastName}` : "ไม่ได้กำหนด"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}