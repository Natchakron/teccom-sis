"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Search, GraduationCap, X, Edit } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ code: "", firstName: "", lastName: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🎛️ State สำหรับระบบแก้ไขข้อมูล
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ id: "", firstName: "", lastName: "", password: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // ดึงข้อมูลนักเรียนตอนเปิดหน้าเว็บ
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (err) {
      console.error("ดึงข้อมูลนักเรียนล้มเหลว", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ฟังก์ชันกดบันทึกนักเรียนใหม่
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ code: "", firstName: "", lastName: "", password: "" });
      setIsFormOpen(false);
      fetchStudents(); // ดึงข้อมูลใหม่มาแสดง
    } else {
      const data = await res.json();
      setError(data.error || "เกิดข้อผิดพลาด");
    }
    setLoading(false);
  };

  // ฟังก์ชันเปิดหน้าต่างแก้
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({ id: user.id, firstName: user.firstName, lastName: user.lastName, password: "" });
  };

  // ฟังก์ชันกดเซฟการแก้ไข
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        alert("✅ อัปเดตข้อมูลนักเรียนสำเร็จ!");
        setEditingUser(null);
        fetchStudents(); // โหลดข้อมูลตารางใหม่
      } else {
        alert("❌ เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (error) {
      alert("❌ เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <GraduationCap className="text-blue-600" size={36} />
            ทำเนียบนักเรียน
          </h1>
          <p className="text-slate-500 font-medium mt-1">จัดการข้อมูลนักเรียน แผนกเทคโนโลยีคอมพิวเตอร์</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          {isFormOpen ? <X size={20} /> : <UserPlus size={20} />}
          {isFormOpen ? "ปิดฟอร์ม" : "เพิ่มนักเรียนใหม่"}
        </motion.button>
      </div>

      {/* ฟอร์มเพิ่มนักเรียน (มีแอนิเมชันเปิด/ปิด) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">ลงทะเบียนนักเรียนใหม่</h2>
            {error && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสนักศึกษา</label>
                <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น 66302040001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ชื่อจริง" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="นามสกุล" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านเริ่มต้น</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ตั้งรหัสผ่าน" />
              </div>
              <div className="lg:col-span-4 flex justify-end mt-2">
                <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ตารางแสดงรายชื่อนักเรียน */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหานักเรียน..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            จำนวนทั้งหมด {students.length} คน
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">ลำดับ</th>
                <th className="py-4 px-6 font-semibold">รหัสนักศึกษา</th>
                <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-4 px-6 font-semibold">สถานะ</th>
                <th className="py-4 px-6 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">ยังไม่มีข้อมูลนักเรียนในระบบ</td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-500">{index + 1}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{student.code}</td>
                    <td className="py-4 px-6 text-slate-600">{student.firstName} {student.lastName}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium border border-sky-200">STUDENT</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                        >
                          <Edit size={16} /> แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ================= Modal แก้ไขข้อมูลนักเรียน ================= */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-100"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Edit size={24} className="text-amber-500" /> แก้ไขข้อมูลนักเรียน
              </h2>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                  <p className="text-xs text-slate-500">รหัสนักศึกษา</p>
                  <p className="font-bold text-slate-800">{editingUser.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อ</label>
                    <input type="text" required value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">นามสกุล</label>
                    <input type="text" required value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่านใหม่</label>
                  <input type="password" placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน..." value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">*หากนักเรียนลืมรหัสผ่าน แอดมินสามารถตั้งค่าให้ใหม่ตรงนี้ได้เลย</p>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                    {isUpdating ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}