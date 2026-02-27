"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Monitor, Code, Cpu, ArrowRight, ShieldCheck, User, 
  LayoutDashboard, Loader2, Megaphone, AlertTriangle, AlertOctagon, Info,
  Laptop, Database, GraduationCap
} from "lucide-react";

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const resSession = await getSession();
      setSession(resSession);
      setIsLoading(false);

      try {
        const resNews = await fetch("/api/announcements");
        const dataNews = await resNews.json();
        if (Array.isArray(dataNews)) {
          setNews(dataNews.slice(0, 3)); 
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  let btnText = "เข้าสู่ระบบ";
  let btnLink = "/login";
  let BtnIcon = ArrowRight;

  if (session?.user) {
    if (session.user.role === "STUDENT") {
      btnText = "โปรไฟล์ของฉัน";
      btnLink = "/student";
      BtnIcon = User;
    } else {
      btnText = "ระบบหลังบ้าน";
      btnLink = "/dashboard";
      BtnIcon = LayoutDashboard;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">
      {/* แถบนำทาง (Navbar) */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl">
              <Monitor className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">TECCOM</h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest">CHAINAT TECH</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">หน้าหลัก</Link>
            <Link href="#news" className="hover:text-blue-600 transition-colors">ข่าวสาร</Link>
            <Link href="#programs" className="hover:text-blue-600 transition-colors">หลักสูตร</Link>
            <Link href="#features" className="hover:text-blue-600 transition-colors">จุดเด่น</Link>
          </div>

          <Link 
            href={btnLink} 
            className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>{btnText} <BtnIcon size={16} /></>}
          </Link>
        </div>
      </nav>

      {/* ส่วนต้อนรับ (Hero Section) */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-24 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial="hidden" animate="show" variants={fadeIn}>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wider mb-6">
              ยินดีต้อนรับสู่ระบบสารสนเทศ
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
              แผนกเทคโนโลยีคอมพิวเตอร์ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                วิทยาลัยเทคนิคชัยนาท
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              มุ่งมั่นพัฒนานักปฏิบัติการด้านคอมพิวเตอร์และเครือข่าย สร้างสรรค์นวัตกรรม 
              และก้าวทันเทคโนโลยีแห่งอนาคต เพื่อตอบสนองความต้องการของภาคอุตสาหกรรมดิจิทัล
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href={btnLink} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 text-lg"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <><BtnIcon size={20} /> ไปที่{btnText}</>}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 📣 ประกาศข่าวสารล่าสุด */}
      {news.length > 0 && (
        <div id="news" className="bg-white py-20 border-t border-slate-100 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-sky-100 text-sky-600 p-3.5 rounded-2xl">
                <Megaphone size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">ประกาศข่าวสารล่าสุด</h2>
                <p className="text-slate-500 mt-1">อัปเดตข้อมูลและกิจกรรมจากแผนกเทคโนโลยีคอมพิวเตอร์</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <motion.div whileHover={{ y: -5 }} key={item.id} className="bg-slate-50 rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative flex flex-col transition-all">
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${item.type === 'URGENT' ? 'bg-rose-500' : item.type === 'WARNING' ? 'bg-amber-500' : 'bg-sky-500'}`} />
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm
                        ${item.type === 'URGENT' ? 'bg-rose-100 text-rose-700 border border-rose-200' : item.type === 'WARNING' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-sky-100 text-sky-700 border border-sky-200'}`}>
                        {item.type === 'URGENT' ? <AlertOctagon size={14}/> : item.type === 'WARNING' ? <AlertTriangle size={14}/> : <Info size={14}/>}
                        {item.type === 'URGENT' ? 'ด่วนมาก' : item.type === 'WARNING' ? 'สำคัญ' : 'แจ้งข่าวสาร'}
                      </span>
                      <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                        {new Date(item.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3 leading-snug">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🎓 หลักสูตรที่เปิดสอน (Our Programs) - เพิ่งเพิ่มใหม่! */}
      <div id="programs" className="bg-slate-50 py-24 border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-bold tracking-wider mb-4 flex items-center justify-center w-max mx-auto gap-2">
              <GraduationCap size={16} /> OUR PROGRAMS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">หลักสูตรที่เปิดสอน</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              แผนกเทคโนโลยีคอมพิวเตอร์ มุ่งเน้นการเรียนการสอนที่ทันสมัย ทฤษฎีควบคู่ปฏิบัติจริง เพื่อผลิตบุคลากรที่มีคุณภาพสู่ตลาดแรงงานยุคดิจิทัล
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ระดับ ปวช. */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Laptop size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">ระดับ ปวช.</h3>
                    <p className="text-blue-600 font-medium">สาขางานเทคโนโลยีคอมพิวเตอร์</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  ปูพื้นฐานทางด้านคอมพิวเตอร์อย่างครอบคลุม เรียนรู้การประกอบ ซ่อมบำรุงคอมพิวเตอร์ การติดตั้งระบบปฏิบัติการ พื้นฐานระบบเครือข่ายเบื้องต้น และตรรกะการเขียนโปรแกรม
                </p>
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">ทักษะที่จะได้รับ:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">IT Support</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Hardware & OS</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Basic Network</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Coding Basics</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ระดับ ปวส. */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Database size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">ระดับ ปวส.</h3>
                    <p className="text-indigo-600 font-medium">สาขางานนักพัฒนาระบบ / เครือข่าย</p>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  เจาะลึกการพัฒนาซอฟต์แวร์ เว็บไซต์ และแอปพลิเคชันมือถือ รวมถึงการบริหารจัดการเครื่องแม่ข่าย (Server) ระบบเครือข่ายขั้นสูง และเทคโนโลยีสมองกลฝังตัว (IoT)
                </p>
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">ทักษะที่จะได้รับ:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Web & App Dev</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">System Analysis</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Advanced Network</span>
                    <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Server & IoT</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* จุดเด่นของแผนก */}
      <div id="features" className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">ทำไมต้องเรียนกับเรา?</h2>
            <p className="text-slate-500">เราเน้นการลงมือปฏิบัติจริง ด้วยเครื่องมือและห้องปฏิบัติการที่ทันสมัย</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Code size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">การเขียนโปรแกรม</h3>
              <p className="text-slate-600 leading-relaxed">
                เรียนรู้การพัฒนาเว็บไซต์, แอปพลิเคชันมือถือ และระบบฐานข้อมูลด้วยภาษาโปรแกรมมิ่งที่ตลาดงานต้องการ
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">ระบบเครือข่าย</h3>
              <p className="text-slate-600 leading-relaxed">
                ฝึกปฏิบัติติดตั้งและคอนฟิกอุปกรณ์ Network, Server รวมถึงการรักษาความปลอดภัยทางไซเบอร์
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 shadow-lg shadow-slate-200/50 border border-slate-100 transition-all">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Cpu size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">ฮาร์ดแวร์ & IoT</h3>
              <p className="text-slate-600 leading-relaxed">
                ประกอบ ซ่อมบำรุงคอมพิวเตอร์ และพัฒนาระบบสมองกลฝังตัว ควบคุมอุปกรณ์อัจฉริยะด้วย Arduino / ESP32
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Monitor size={24} className="text-blue-500" />
            <span className="text-xl font-bold text-white">TECCOM SIS</span>
          </div>
          <p>© {new Date().getFullYear()} แผนกเทคโนโลยีคอมพิวเตอร์ วิทยาลัยเทคนิคชัยนาท.</p>
        </div>
      </footer>
    </div>
  );
}