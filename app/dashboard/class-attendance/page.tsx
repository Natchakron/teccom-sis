"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar as CalendarIcon, Users, CheckCircle, Clock, XCircle, FileText, Save } from "lucide-react";

export default function ClassAttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ดึงรายวิชามาให้เลือกตอนเปิดหน้าเว็บ
  useEffect(() => {
    const fetchSubjects = async () => {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      if (Array.isArray(data)) setSubjects(data);
    };
    fetchSubjects();
  }, []);

  // ดึงรายชื่อนักเรียนเมื่อกดปุ่มค้นหา
  const loadStudents = async () => {
    if (!selectedSubject) return alert("กรุณาเลือกรายวิชา");
    setLoading(true);
    
    const res = await fetch(`/api/class-attendance?subjectId=${selectedSubject}&date=${selectedDate}`);
    const data = await res.json();
    
    if (Array.isArray(data)) {
      setEnrollments(data);
      // ตั้งค่าสถานะเริ่มต้น: ถ้าเคยเช็คแล้วดึงของเดิมมา ถ้ายังไม่เช็คตั้งเป็น "PRESENT" อัตโนมัติ
      const initialState: Record<string, string> = {};
      data.forEach((enrol: any) => {
        if (enrol.classChecks && enrol.classChecks.length > 0) {
          initialState[enrol.id] = enrol.classChecks[0].status;
        } else {
          initialState[enrol.id] = "PRESENT";
        }
      });
      setAttendanceState(initialState);
    }
    setLoading(false);
  };

  // บันทึกการเช็คชื่อ
  const handleSave = async () => {
    if (enrollments.length === 0) return;
    setSaving(true);
    
    const attendanceData = Object.keys(attendanceState).map(enrollmentId => ({
      enrollmentId,
      status: attendanceState[enrollmentId]
    }));

    const res = await fetch("/api/class-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, attendanceData }),
    });

    if (res.ok) {
      alert("บันทึกการเช็คชื่อรายวิชาสำเร็จ!");
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
    setSaving(false);
  };

  // อัปเดตสถานะรายคน
  const updateStatus = (enrollmentId: string, status: string) => {
    setAttendanceState(prev => ({ ...prev, [enrollmentId]: status }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Users className="text-indigo-500" size={36} />
            เช็คชื่อเข้าเรียน (รายวิชา)
          </h1>
          <p className="text-slate-500 font-medium mt-1">บันทึกการเข้าเรียนของนักศึกษาในคาบเรียน</p>
        </motion.div>
      </div>

      {/* ส่วนเลือกวิชาและวันที่ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><BookOpen size={16}/> เลือกรายวิชา</label>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700">
            <option value="">-- กรุณาเลือกรายวิชา --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.subjectCode} - {s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><CalendarIcon size={16}/> วันที่สอน</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button onClick={loadStudents} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
          {loading ? "กำลังโหลด..." : "ดึงรายชื่อนักศึกษา"}
        </button>
      </motion.div>

      {/* ตารางเช็คชื่อ */}
      {enrollments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-700">รายชื่อนักศึกษา ({enrollments.length} คน)</h2>
            <button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md">
              <Save size={18} /> {saving ? "กำลังบันทึก..." : "บันทึกการเช็คชื่อ"}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 text-sm border-b">
                <tr>
                  <th className="py-4 px-6 font-semibold w-16">ลำดับ</th>
                  <th className="py-4 px-6 font-semibold">รหัสนักศึกษา</th>
                  <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                  <th className="py-4 px-6 font-semibold text-center">สถานะการเข้าเรียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enrol, index) => {
                  const status = attendanceState[enrol.id];
                  return (
                    <tr key={enrol.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">{enrol.student.code}</td>
                      <td className="py-4 px-6 font-medium text-slate-800">{enrol.student.firstName} {enrol.student.lastName}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateStatus(enrol.id, 'PRESENT')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border-2 transition-all ${status === 'PRESENT' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-emerald-200'}`}>
                            <CheckCircle size={18} className="mb-1" /> <span className="text-[10px] font-bold">มา</span>
                          </button>
                          <button onClick={() => updateStatus(enrol.id, 'LATE')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border-2 transition-all ${status === 'LATE' ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-orange-200'}`}>
                            <Clock size={18} className="mb-1" /> <span className="text-[10px] font-bold">สาย</span>
                          </button>
                          <button onClick={() => updateStatus(enrol.id, 'ABSENT')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border-2 transition-all ${status === 'ABSENT' ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-rose-200'}`}>
                            <XCircle size={18} className="mb-1" /> <span className="text-[10px] font-bold">ขาด</span>
                          </button>
                          <button onClick={() => updateStatus(enrol.id, 'LEAVE')} className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl border-2 transition-all ${status === 'LEAVE' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                            <FileText size={18} className="mb-1" /> <span className="text-[10px] font-bold">ลา</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}