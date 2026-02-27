"use client";

import { useEffect, useState } from "react";
import { getSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, User, QrCode, Clock, CalendarDays, ShieldCheck, 
  ChevronRight, BookOpen, Award, CheckSquare, Star, MapPin, TrendingUp,  FileText,
  Megaphone, AlertTriangle, AlertOctagon, Info, ShieldAlert // 👈 เพิ่มไอคอนโล่
} from "lucide-react";

export default function StudentPage() {
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // State เก็บข้อมูลของจริง
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [myGrades, setMyGrades] = useState<any[]>([]);
  const [mySchedule, setMySchedule] = useState<any[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  
  // State ใหม่: คะแนนความประพฤติ
  const [behaviorRecords, setBehaviorRecords] = useState<any[]>([]);
  const [behaviorPoints, setBehaviorPoints] = useState<number>(100); // เริ่มที่ 100
  
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);
        
        // 🚀 สร้างตัวแปรมารับค่าแบบสับขาหลอก Vercel ไปเลยทีเดียว
        const userId = (session.user as any).id;
        
        // 🌟 ดึงรูปโปรไฟล์ล่าสุด
        try {
          const resProfile = await fetch(`/api/upload-profile?userId=${userId}`);
          if (resProfile.ok) {
            const profileData = await resProfile.json();
            if (profileData?.image) {
              setUser((prev: any) => ({ ...prev, image: profileData.image }));
            }
          }
        } catch (error) { console.error("โหลดรูปไม่สำเร็จ", error); }

        // 1. ดึงประวัติเข้าแถว
        try {
          const resAtt = await fetch(`/api/my-attendance?studentId=${userId}`);
          const dataAtt = await resAtt.json();
          if (Array.isArray(dataAtt)) setAttendanceRecords(dataAtt);
        } catch (error) {}

        // 2. ดึงข้อมูลเกรด
        try {
          const resGrades = await fetch(`/api/my-grades?studentId=${userId}`);
          const dataGrades = await resGrades.json();
          if (Array.isArray(dataGrades)) setMyGrades(dataGrades);
        } catch (error) {}

        // 3. ดึงตารางเรียน
        try {
          const resSched = await fetch(`/api/schedules?studentId=${userId}`);
          const dataSched = await resSched.json();
          if (Array.isArray(dataSched)) {
            const daysOrder = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"];
            dataSched.sort((a, b) => {
              if (daysOrder.indexOf(a.dayOfWeek) !== daysOrder.indexOf(b.dayOfWeek)) {
                return daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek);
              }
              return a.startTime.localeCompare(b.startTime);
            });
            setMySchedule(dataSched);
          }
        } catch (error) {}

        // 4. ดึงประวัติการลา
        try {
          const resLeave = await fetch(`/api/leave-requests?studentId=${userId}`);
          const dataLeave = await resLeave.json();
          if (Array.isArray(dataLeave)) setLeaveRecords(dataLeave);
        } catch (error) {}

        // 5. ดึงประกาศข่าวสาร
        try {
          const resNews = await fetch("/api/announcements");
          const dataNews = await resNews.json();
          if (Array.isArray(dataNews)) setNews(dataNews);
        } catch (error) {}

        // 6. ดึงข้อมูลคะแนนความประพฤติ
        try {
          const resBehav = await fetch(`/api/behavior?studentId=${userId}`);
          const dataBehav = await resBehav.json();
          if (Array.isArray(dataBehav)) {
             setBehaviorRecords(dataBehav);
             const totalPoints = dataBehav.reduce((sum: number, rec: any) => sum + rec.points, 0);
             setBehaviorPoints(100 + totalPoints);
          }
        } catch (error) {}
      }
    };
    fetchSessionAndData();

    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || !time) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // คำนวณเกรดเฉลี่ย
  let avgGrade = "0.00";
  if (myGrades.length > 0) {
    const totalGrades = myGrades.reduce((sum, item) => sum + parseFloat(item.gradeResult || "0"), 0);
    avgGrade = (totalGrades / myGrades.length).toFixed(2);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px]" />
      </div>

      <div className="max-w-md mx-auto relative z-10 p-4 sm:p-6 space-y-6">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              {/* ซ่อน Input File ไว้ พอกดที่รูปจะไปทริกเกอร์ตัวนี้ */}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // แปลงไฟล์รูปเป็น Base64
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const base64String = reader.result;
                    // อัปเดต UI ทันทีให้ดูไว
                    setUser({...user, image: base64String}); 
                    
                    // ส่งไปบันทึกหลังบ้าน
                    await fetch("/api/upload-profile", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id, imageBase64: base64String })
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full p-0.5 overflow-hidden">
                <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center overflow-hidden relative">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-white" />
                  )}
                  {/* กรอบดำๆ โชว์ตอนเอาเมาส์ชี้ */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white">เปลี่ยนรูป</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-[#0f172a] z-10">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{user.name}</h1>
              <p className="text-blue-300 text-xs font-medium tracking-widest">{user.code}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="p-3 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl transition-all">
            <LogOut size={20} />
          </button>
        </motion.div>

        {/* เมนูนำทาง (Tabs) - เลื่อนซ้ายขวาได้ */}
        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl backdrop-blur-md overflow-x-auto no-scrollbar border border-white/5">
          {[
            { id: "overview", name: "หน้าหลัก", icon: QrCode },
            { id: "grades", name: "ผลการเรียน", icon: Star },
            { id: "schedule", name: "ตารางเรียน", icon: CalendarDays },
            { id: "attendance", name: "เข้าแถว", icon: CheckSquare },
            { id: "leave", name: "ลาหยุด", icon: FileText },
            { id: "behavior", name: "ความประพฤติ", icon: ShieldAlert }, // 👈 แท็บใหม่!
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-none flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all min-w-[75px] ${
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* พื้นที่แสดงเนื้อหา */}
        <AnimatePresence mode="wait">
          
          {/* Tab 1: หน้าหลัก */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              
              {/* หลอดคะแนนความประพฤติ (HP Bar) */}
              <div className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-md shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-bold flex items-center gap-2">
                    <ShieldAlert size={18} className={behaviorPoints >= 80 ? 'text-emerald-400' : behaviorPoints >= 60 ? 'text-amber-400' : 'text-rose-400'} />
                    คะแนนความประพฤติ
                  </span>
                  <span className={`text-xl font-extrabold ${behaviorPoints >= 80 ? 'text-emerald-400' : behaviorPoints >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {behaviorPoints} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 mt-3 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, behaviorPoints))}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      behaviorPoints >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 
                      behaviorPoints >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 
                      'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    }`}
                  />
                </div>
              </div>

              {/* สแกน QR Code */}
              <div className="relative cursor-pointer group mt-4">
                <div className="absolute inset-0 bg-blue-500 rounded-[2rem] animate-ping opacity-20" />
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 relative z-10 shadow-2xl shadow-blue-500/30 border border-white/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="flex items-center gap-5">
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                      <QrCode className="text-white" size={36} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">สแกนเข้าแถว</h2>
                      <p className="text-blue-200 text-sm">แตะเพื่อเปิดกล้องสแกน QR Code</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* การ์ดสถิติ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="text-emerald-400 mb-2"><TrendingUp size={24} /></div>
                  <p className="text-slate-400 text-xs mb-1">เกรดเฉลี่ยเบื้องต้น</p>
                  <p className="text-2xl font-bold text-white">{avgGrade}</p>
                </div>
                <div className="bg-white/10 p-5 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="text-amber-400 mb-2"><CheckSquare size={24} /></div>
                  <p className="text-slate-400 text-xs mb-1">สแกนไปแล้ว</p>
                  <p className="text-2xl font-bold text-white">{attendanceRecords.length} วัน</p>
                </div>
              </div>

              {/* ประกาศข่าวสาร */}
              {news.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Megaphone size={20} className="text-sky-400" /> ประกาศล่าสุด
                  </h2>
                  <div className="space-y-3">
                    {news.map((item) => (
                      <div key={item.id} className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.type === 'URGENT' ? 'bg-rose-500' : item.type === 'WARNING' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                        <div className="pl-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-white text-sm">{item.title}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ml-2
                              ${item.type === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : item.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-sky-500/20 text-sky-400'}`}>
                              {item.type === 'URGENT' ? 'ด่วนมาก' : item.type === 'WARNING' ? 'สำคัญ' : 'แจ้งเตือน'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs mt-2 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: ผลการเรียน */}
          {activeTab === "grades" && (
            <motion.div key="grades" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-lg font-bold text-white">ผลการเรียนทั้งหมด</h2>
              </div>
              <div className="space-y-3">
                {myGrades.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 bg-white/5 rounded-2xl border border-white/5">
                    <p>ยังไม่มีข้อมูลผลการเรียน</p>
                  </div>
                ) : (
                  myGrades.map((item) => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{item.enrollment.subject.name}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          รหัส: {item.enrollment.subject.subjectCode} | เทอม: {item.enrollment.term}
                        </p>
                      </div>
                      <div className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-2 rounded-xl text-lg">
                        {item.gradeResult}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 3: ตารางเรียน */}
          {activeTab === "schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-white">ตารางเรียนของฉัน</h2>
              </div>
              {mySchedule.length === 0 ? (
                <div className="text-center text-slate-400 py-8 bg-white/5 rounded-2xl border border-white/5">
                  <p>ยังไม่มีตารางเรียน</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-700 ml-4 space-y-6 pb-4 mt-6">
                  {mySchedule.map((cls, idx) => (
                    <div key={cls.id} className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                      <div className="flex gap-2 items-center mb-1">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-xs font-bold">{cls.dayOfWeek}</span>
                        <p className="text-blue-400 text-xs font-bold">{cls.startTime} - {cls.endTime}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-white font-medium text-sm mb-2">{cls.subject.name}</p>
                        <p className="text-slate-400 text-xs flex items-center gap-1"><MapPin size={12}/> {cls.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 4: ประวัติเข้าแถว */}
          {activeTab === "attendance" && (
            <motion.div key="attendance" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-2">ประวัติเข้าแถว 5 วันล่าสุด</h2>
              <div className="space-y-3">
                {attendanceRecords.length === 0 ? (
                  <div className="text-center text-slate-400 py-8 bg-white/5 rounded-2xl border border-white/5">
                    <p>ยังไม่มีประวัติการสแกน</p>
                  </div>
                ) : (
                  attendanceRecords.map((record) => (
                    <div key={record.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${record.status === 'LATE' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <CheckSquare size={20} />
                        </div>
                        <div>
                          <p className="text-white text-sm">
                            {new Date(record.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            เวลา {new Date(record.timeIn).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${record.status === 'LATE' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {record.status === 'LATE' ? 'มาสาย' : 'ตรงเวลา'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 5: แจ้งลาหยุด */}
          {activeTab === "leave" && (
            <motion.div key="leave" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="bg-white/10 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
                <h2 className="text-lg font-bold text-white mb-4">เขียนใบลาหยุด</h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    try {
                      const res = await fetch("/api/leave-requests", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...leaveForm, studentId: user.id }),
                      });
                      if (res.ok) {
                        alert("ส่งใบลาสำเร็จ! รออาจารย์อนุมัตินะครับ");
                        setLeaveForm({ startDate: "", endDate: "", reason: "" });
                        const resLeave = await fetch(`/api/leave-requests?studentId=${user.id}`);
                        setLeaveRecords(await resLeave.json());
                      }
                    } catch (error) {}
                    setIsSubmitting(false);
                  }} 
                  className="space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">ตั้งแต่วันที่</label>
                      <input type="date" required value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full bg-black/20 text-sm text-white border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-400 mb-1">ถึงวันที่</label>
                      <input type="date" required value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full bg-black/20 text-sm text-white border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">เหตุผลการลา</label>
                    <textarea required value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full bg-black/20 text-sm text-white border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-blue-500 min-h-[80px]"></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25">
                    {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งใบลาหยุด"}
                  </button>
                </form>
              </div>

              <h2 className="text-sm font-bold text-white mt-6 mb-2">ประวัติการลาของฉัน</h2>
              <div className="space-y-3">
                {leaveRecords.map((leave) => (
                  <div key={leave.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leave.status === 'APPROVED' ? 'bg-emerald-500' : leave.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <div className="pl-4">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white text-sm font-medium">{leave.reason}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          leave.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 
                          leave.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {leave.status === 'APPROVED' ? 'อนุมัติแล้ว' : leave.status === 'REJECTED' ? 'ไม่อนุมัติ' : 'รอตรวจสอบ'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <CalendarDays size={12}/> 
                        {new Date(leave.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 6: ประวัติความประพฤติ (ใหม่ล่าสุด!) */}
          {activeTab === "behavior" && (
            <motion.div key="behavior" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md text-center shadow-xl">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-[0_0_20px_rgba(0,0,0,0.2)] border-4
                  ${behaviorPoints >= 80 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 
                    behaviorPoints >= 60 ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 
                    'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}>
                  <span className="text-4xl font-extrabold">{behaviorPoints}</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">คะแนนความประพฤติรวม</h2>
                <p className="text-slate-400 text-xs">คะแนนเริ่มต้น 100 คะแนน</p>
              </div>

              <h2 className="text-sm font-bold text-white mt-6 mb-2">ประวัติการหัก/เพิ่มคะแนน</h2>
              <div className="space-y-3">
                {behaviorRecords.length === 0 ? (
                  <div className="text-center text-slate-400 py-6 bg-white/5 rounded-2xl border border-white/5 text-sm">
                    คุณยังไม่มีประวัติการถูกหักหรือเพิ่มคะแนน
                  </div>
                ) : (
                  behaviorRecords.map((record) => (
                    <div key={record.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{record.reason}</p>
                        <p className="text-slate-400 text-xs mt-1">
                          {new Date(record.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-bold text-lg border ${
                        record.points > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {record.points > 0 ? `+${record.points}` : record.points}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}