"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Search, PlusCircle, X, GraduationCap, BookOpen } from "lucide-react";

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: "", subjectId: "", term: "1/2569", gradeResult: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    // ดึงข้อมูล เกรด, นักเรียน, วิชา พร้อมๆ กัน
    const [gradesRes, studentsRes, subjectsRes] = await Promise.all([
      fetch("/api/grades"),
      fetch("/api/students"),
      fetch("/api/subjects")
    ]);
    
    setGrades(await gradesRes.json());
    setStudents(await studentsRes.json());
    setSubjects(await subjectsRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ ...formData, gradeResult: "" }); // เคลียร์แค่ช่องเกรด เผื่อกรอกคนต่อไป
      setIsFormOpen(false);
      fetchData();
    } else {
      const data = await res.json();
      setError(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Star className="text-yellow-500" size={36} />
            จัดการผลการเรียน
          </h1>
          <p className="text-slate-500 font-medium mt-1">บันทึกและตรวจสอบเกรดของนักเรียน</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-yellow-500/30 transition-all"
        >
          {isFormOpen ? <X size={20} /> : <PlusCircle size={20} />}
          {isFormOpen ? "ปิดฟอร์ม" : "บันทึกเกรดใหม่"}
        </motion.button>
      </div>

      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">แบบฟอร์มบันทึกผลการเรียน</h2>
          {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><GraduationCap size={16}/> นักเรียน</label>
              <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-slate-700">
                <option value="">-- เลือกนักเรียน --</option>
                {Array.isArray(students) && students.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} - {s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><BookOpen size={16}/> รายวิชา</label>
              <select required value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-slate-700">
                <option value="">-- เลือกวิชา --</option>
                {Array.isArray(subjects) && subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.subjectCode} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ภาคเรียน / ปีการศึกษา</label>
              <input type="text" required value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="เช่น 1/2569" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ผลการเรียน (เกรด)</label>
              <input type="text" required value={formData.gradeResult} onChange={(e) => setFormData({...formData, gradeResult: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-emerald-600" placeholder="เช่น 4.0, 3.5, B+" />
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูลเกรด"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ตารางแสดงเกรด */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหาข้อมูล..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            จำนวนข้อมูล {Array.isArray(grades) ? grades.length : 0} รายการ
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">ภาคเรียน</th>
                <th className="py-4 px-6 font-semibold">รหัสนักศึกษา</th>
                <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-4 px-6 font-semibold">วิชา</th>
                <th className="py-4 px-6 font-semibold text-center">ผลการเรียน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!Array.isArray(grades) || grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">ยังไม่มีข้อมูลผลการเรียนในระบบ</td>
                </tr>
              ) : (
                grades.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-600">{item.enrollment.term}</td>
                    <td className="py-4 px-6 text-slate-600">{item.enrollment.student.code}</td>
                    <td className="py-4 px-6 text-slate-800">{item.enrollment.student.firstName} {item.enrollment.student.lastName}</td>
                    <td className="py-4 px-6 text-slate-600">{item.enrollment.subject.name}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                        {item.gradeResult}
                      </span>
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