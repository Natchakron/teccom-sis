"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, PlusCircle, Search, User, Award, AlertOctagon, Printer } from "lucide-react";

export default function BehaviorPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({ studentId: "", points: "", reason: "", type: "deduct" });

  const fetchStudents = async () => {
    const res = await fetch("/api/behavior");
    const data = await res.json();
    if (Array.isArray(data)) setStudents(data);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let finalPoints = parseInt(formData.points);
    if (formData.type === "deduct") finalPoints = -Math.abs(finalPoints);
    if (formData.type === "add") finalPoints = Math.abs(finalPoints);

    try {
      const res = await fetch("/api/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: formData.studentId,
          points: finalPoints,
          reason: formData.reason
        }),
      });

      if (res.ok) {
        alert("บันทึกข้อมูลความประพฤติสำเร็จ!");
        setFormData({ studentId: "", points: "", reason: "", type: "deduct" });
        setIsFormOpen(false);
        fetchStudents();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(s => 
    s.firstName.includes(searchTerm) || s.lastName.includes(searchTerm) || s.code.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto pb-10 relative">
      
      {/* =========================================================
          ส่วนที่ 1: หน้าเว็บ (โชว์ปกติ แต่ซ่อนตอนปริ้นต์ด้วย print:hidden)
      ========================================================= */}
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <ShieldAlert className="text-rose-500" size={36} />
              คะแนนความประพฤติ
            </h1>
            <p className="text-slate-500 font-medium mt-1">ระบบบันทึกการหักและเพิ่มคะแนนนักศึกษา (เริ่มที่ 100 คะแนน)</p>
          </motion.div>

          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
            >
              <Printer size={20} /> ออกรายงาน PDF
            </button>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all">
              <PlusCircle size={20} /> {isFormOpen ? "ปิดฟอร์ม" : "บันทึกความประพฤติ"}
            </button>
          </div>
        </div>

        {isFormOpen && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลือกนักศึกษา</label>
                <select required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-700">
                  <option value="">-- กรุณาเลือกนักศึกษา --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.code} - {s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ประเภท</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-rose-50 px-4 py-3 rounded-xl border border-rose-200">
                    <input type="radio" name="type" value="deduct" checked={formData.type === "deduct"} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                    <span className="text-rose-700 font-bold flex items-center gap-1"><AlertOctagon size={18}/> หักคะแนน (-)</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200">
                    <input type="radio" name="type" value="add" checked={formData.type === "add"} onChange={(e) => setFormData({...formData, type: e.target.value})} />
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><Award size={18}/> เพิ่มคะแนน (+)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนคะแนน</label>
                <input type="number" min="1" max="100" required value={formData.points} onChange={(e) => setFormData({...formData, points: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-lg" placeholder="เช่น 5, 10, 20" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">สาเหตุ</label>
                <input type="text" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="เช่น มาสาย, แต่งกายผิดระเบียบ, ช่วยงานแผนก" />
              </div>
            </div>
            
            <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
              <button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                {loading ? "กำลังบันทึก..." : "ยืนยันการบันทึกข้อมูล"}
              </button>
            </div>
          </motion.form>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="ค้นหาชื่อ/รหัสนักศึกษา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none w-64 bg-white" />
            </div>
            <div className="text-sm font-medium text-slate-500">
              จำนวนนักศึกษาทั้งหมด {filteredStudents.length} คน
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 text-sm border-b">
                <tr>
                  <th className="py-4 px-6 font-semibold">รหัสนักศึกษา</th>
                  <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                  <th className="py-4 px-6 font-semibold text-center">ประวัติถูกหัก/เพิ่ม (ครั้ง)</th>
                  <th className="py-4 px-6 font-semibold text-center">คะแนนคงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-600">{student.code}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 p-2 rounded-full text-slate-500"><User size={16}/></div>
                        <span className="font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 font-medium">
                      {student.behaviorRecords?.length || 0} ครั้ง
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm
                        ${student.currentPoints >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          student.currentPoints >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {student.currentPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* =========================================================
          ส่วนที่ 2: แบบฟอร์มรายงานราชการ (ซ่อนปกติ แต่โชว์เฉพาะตอนปริ้นต์)
      ========================================================= */}
      <div className="hidden print:block text-black bg-white w-full font-serif">
        
        {/* ส่วนหัวกระดาษแบบฟอร์มราชการ */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="โลโก้วิทยาลัย" className="w-24 h-24 mb-4 object-contain grayscale" />
          <h1 className="text-2xl font-bold mb-2">รายงานสรุปคะแนนความประพฤตินักศึกษา</h1>
          <h2 className="text-xl mb-1">แผนกเทคโนโลยีคอมพิวเตอร์ วิทยาลัยเทคนิคชัยนาท</h2>
          <p className="text-md">
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ตารางตีเส้นดำแบบเอกสาร */}
        <table className="w-full text-center border-collapse border border-black mb-12">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black py-3 px-4 font-bold w-16">ลำดับ</th>
              <th className="border border-black py-3 px-4 font-bold w-40">รหัสประจำตัว</th>
              <th className="border border-black py-3 px-4 font-bold text-left">ชื่อ - นามสกุล</th>
              <th className="border border-black py-3 px-4 font-bold w-32">ถูกหัก/เพิ่ม (ครั้ง)</th>
              <th className="border border-black py-3 px-4 font-bold w-32">คะแนนคงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr key={student.id}>
                <td className="border border-black py-2 px-4">{idx + 1}</td>
                <td className="border border-black py-2 px-4">{student.code}</td>
                <td className="border border-black py-2 px-4 text-left">{student.firstName} {student.lastName}</td>
                <td className="border border-black py-2 px-4">{student.behaviorRecords?.length || 0}</td>
                <td className="border border-black py-2 px-4 font-bold">{student.currentPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ช่องลายเซ็นท้ายรายงาน */}
        <div className="flex justify-end pr-10 mt-16">
          <div className="text-center space-y-3">
            <p>ลงชื่อ.........................................................ผู้รายงาน</p>
            <p>(.........................................................)</p>
            <p>ตำแหน่ง.........................................................</p>
          </div>
        </div>
        
      </div>

    </div>
  );
}