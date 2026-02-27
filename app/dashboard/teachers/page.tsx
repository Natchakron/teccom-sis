"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Search, UserCog, X } from "lucide-react";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", firstName: "", lastName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    const res = await fetch("/api/teachers");
    const data = await res.json();
    if (Array.isArray(data)) setTeachers(data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ code: "", firstName: "", lastName: "", password: "" });
      setIsFormOpen(false);
      fetchTeachers();
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
            <UserCog className="text-indigo-600" size={36} />
            ทำเนียบอาจารย์
          </h1>
          <p className="text-slate-500 font-medium mt-1">จัดการข้อมูลบุคลากร แผนกเทคโนโลยีคอมพิวเตอร์</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          {isFormOpen ? <X size={20} /> : <UserPlus size={20} />}
          {isFormOpen ? "ปิดฟอร์ม" : "เพิ่มอาจารย์ใหม่"}
        </motion.button>
      </div>

      {/* ฟอร์มเพิ่มอาจารย์ */}
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">ลงทะเบียนอาจารย์ใหม่</h2>
          {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสประจำตัวอาจารย์</label>
              <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="เช่น T001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ชื่อจริง" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="นามสกุล" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านเริ่มต้น</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ตั้งรหัสผ่าน" />
            </div>
            <div className="lg:col-span-4 flex justify-end mt-2">
              <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* ตารางแสดงรายชื่ออาจารย์ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหาอาจารย์..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            จำนวนทั้งหมด {teachers.length} ท่าน
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">ลำดับ</th>
                <th className="py-4 px-6 font-semibold">รหัสประจำตัว</th>
                <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-4 px-6 font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">ยังไม่มีข้อมูลอาจารย์ในระบบ</td>
                </tr>
              ) : (
                teachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-500">{index + 1}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{teacher.code}</td>
                    <td className="py-4 px-6 text-slate-600">อ. {teacher.firstName} {teacher.lastName}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">TEACHER</span>
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