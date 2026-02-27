"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, UserCog, QrCode, CheckCircle, 
  Activity, Megaphone, FileText, ShieldAlert, Award, Clock
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayScans: 0,
    isSystemOpen: true
  });
  
  // State สำหรับเก็บประวัติกิจกรรมล่าสุด
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    // ฟังก์ชันสมมติสำหรับดึงตัวเลขสถิติของการ์ดด้านบน (คุณสามารถแก้ให้ดึงจาก Database จริงได้ภายหลัง)
    const fetchStats = async () => {
      setStats({
        totalStudents: 1, // ค่าจำลอง
        totalTeachers: 1, // ค่าจำลอง
        todayScans: 1,    // ค่าจำลอง
        isSystemOpen: false // ค่าจำลอง
      });
    };

    // ฟังก์ชันดึงกิจกรรมล่าสุด (ของจริง)
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/recent-activities");
        const data = await res.json();
        if (Array.isArray(data)) {
          setActivities(data);
        }
      } catch (error) {
        console.error("Failed to load activities", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  // ฟังก์ชันเลือกไอคอนและสีให้ตรงกับประเภทกิจกรรม
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT": return { icon: Megaphone, color: "bg-sky-100 text-sky-600", border: "border-sky-200" };
      case "LEAVE": return { icon: FileText, color: "bg-amber-100 text-amber-600", border: "border-amber-200" };
      case "BEHAVIOR_ADD": return { icon: Award, color: "bg-emerald-100 text-emerald-600", border: "border-emerald-200" };
      case "BEHAVIOR_DEDUCT": return { icon: ShieldAlert, color: "bg-rose-100 text-rose-600", border: "border-rose-200" };
      default: return { icon: Activity, color: "bg-slate-100 text-slate-600", border: "border-slate-200" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* การ์ดสถิติด้านบน */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-blue-500/30">
            <Users size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">นักเรียนทั้งหมด</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalStudents}</h3>
            <span className="text-slate-400 text-sm">คน</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-indigo-500/30">
            <UserCog size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">อาจารย์ทั้งหมด</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalTeachers}</h3>
            <span className="text-slate-400 text-sm">ท่าน</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">สแกนเข้าแถววันนี้</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.todayScans}</h3>
            <span className="text-slate-400 text-sm">คน (รวมสาย)</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-orange-500/30">
            <QrCode size={24} />
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">สถานะระบบสแกน QR</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-extrabold ${stats.isSystemOpen ? 'text-emerald-500' : 'text-slate-800'}`}>
              {stats.isSystemOpen ? 'เปิดใช้งาน' : 'ระบบปิด'}
            </h3>
            <span className="text-slate-400 text-xs text-right leading-tight">07:50 -<br/>08:30</span>
          </div>
        </motion.div>
      </div>

      {/* 🚀 แทนที่พื้นที่ว่างด้วย กิจกรรมล่าสุด (Recent Activities) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Activity size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">ความเคลื่อนไหวล่าสุดในระบบ</h2>
        </div>
        
        <div className="p-6">
          {loadingActivities ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock size={40} className="mx-auto mb-3 opacity-20" />
              <p>ยังไม่มีความเคลื่อนไหวใดๆ ในระบบ</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
              {activities.map((activity, index) => {
                const { icon: Icon, color, border } = getActivityIcon(activity.type);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    key={activity.id} 
                    className="relative pl-8"
                  >
                    {/* จุดวงกลมบน Timeline */}
                    <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${color}`}>
                      <Icon size={14} />
                    </div>
                    
                    <div className={`bg-slate-50 border ${border} p-4 rounded-2xl hover:shadow-md transition-shadow`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm">{activity.title}</h4>
                        <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(activity.time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. 
                          ({new Date(activity.time).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })})
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{activity.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}