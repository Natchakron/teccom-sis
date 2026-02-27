"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Search, User } from "lucide-react";

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leave-requests");
      const data = await res.json();
      if (Array.isArray(data)) setLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/leave-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchLeaves(); // โหลดข้อมูลใหม่หลังจากอัปเดตเสร็จ
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <FileText className="text-pink-500" size={36} />
            จัดการการลาหยุด
          </h1>
          <p className="text-slate-500 font-medium mt-1">ตรวจสอบและอนุมัติใบลาของนักเรียน</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหาชื่อนักเรียน..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none w-64 bg-white" />
          </div>
          <div className="text-sm font-medium text-slate-500">
            ใบลาทั้งหมด {leaves.length} รายการ
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-sm border-b">
              <tr>
                <th className="py-4 px-6 font-semibold">วันที่ส่งใบลา</th>
                <th className="py-4 px-6 font-semibold">นักเรียน</th>
                <th className="py-4 px-6 font-semibold">ช่วงเวลาที่ลา</th>
                <th className="py-4 px-6 font-semibold">เหตุผล</th>
                <th className="py-4 px-6 font-semibold text-center">จัดการสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">ไม่มีข้อมูลการลาหยุด</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-slate-500 text-sm">
                      {new Date(leave.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 p-2 rounded-full text-slate-500"><User size={16}/></div>
                        <div>
                          <p className="font-bold text-slate-800">{leave.student.firstName} {leave.student.lastName}</p>
                          <p className="text-xs text-slate-400">{leave.student.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium text-sm">
                      {new Date(leave.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {leave.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                            disabled={loadingId === leave.id}
                            className="bg-emerald-100 hover:bg-emerald-500 text-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> อนุมัติ
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                            disabled={loadingId === leave.id}
                            className="bg-rose-100 hover:bg-rose-500 text-rose-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <XCircle size={14} /> ไม่อนุมัติ
                          </button>
                        </div>
                      ) : leave.status === 'APPROVED' ? (
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                           <CheckCircle size={14} /> อนุมัติแล้ว
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
                           <XCircle size={14} /> ไม่อนุมัติ
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