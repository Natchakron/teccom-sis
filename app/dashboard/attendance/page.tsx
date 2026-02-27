"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    const res = await fetch("/api/attendance");
    const data = await res.json();
    if (Array.isArray(data)) {
      setRecords(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <ClipboardList className="text-rose-500" size={36} />
            รายงานการเข้าแถว
          </h1>
          <p className="text-slate-500 font-medium mt-1">ประวัติการสแกน QR Code เช็คชื่อของนักเรียน</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={fetchRecords}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          รีเฟรชข้อมูล
        </motion.button>
      </div>

      {/* ตารางแสดงรายงาน */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหารายชื่อ..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            จำนวนการสแกนทั้งหมด {records.length} รายการ
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">วันที่</th>
                <th className="py-4 px-6 font-semibold">เวลาที่สแกน</th>
                <th className="py-4 px-6 font-semibold">รหัสนักศึกษา</th>
                <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-4 px-6 font-semibold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">ยังไม่มีประวัติการสแกนในระบบ</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(record.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {new Date(record.timeIn).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
                    </td>
                    <td className="py-4 px-6 text-slate-600">{record.student.code}</td>
                    <td className="py-4 px-6 text-slate-600">{record.student.firstName} {record.student.lastName}</td>
                    <td className="py-4 px-6 text-center">
                      {record.status === "PRESENT" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} /> มาตรงเวลา
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                          <Clock size={14} /> มาสาย
                        </span>
                      )}
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