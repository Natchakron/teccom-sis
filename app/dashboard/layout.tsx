"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, QrCode, LogOut, GraduationCap, ClipboardList, Star, UserCog, FileText, CheckSquare, Megaphone, ShieldAlert, CalendarDays} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "ภาพรวมระบบ", path: "/dashboard", icon: LayoutDashboard },
    { name: "เช็คชื่อรายวิชา", path: "/dashboard/class-attendance", icon: CheckSquare }, 
    { name: "รายงานการเข้าแถว", path: "/dashboard/attendance", icon: ClipboardList }, 
    { name: "ทำเนียบอาจารย์", path: "/dashboard/teachers", icon: UserCog },
    { name: "คะแนนความประพฤติ", path: "/dashboard/behavior", icon: ShieldAlert },
    { name: "ทำเนียบนักเรียน", path: "/dashboard/students", icon: GraduationCap },
    { name: "จัดการรายวิชา", path: "/dashboard/subjects", icon: BookOpen },
    { name: "จัดการผลการเรียน", path: "/dashboard/grades", icon: Star },
    { name: "ระบบสแกน QR Code", path: "/dashboard/qr-settings", icon: QrCode },
    { name: "จัดการตารางเรียน", path: "/dashboard/schedules", icon: CalendarDays },
    { name: "จัดการการลาหยุด", path: "/dashboard/leave-requests", icon: FileText }, 
    { name: "ประกาศข่าวสาร", path: "/dashboard/announcements", icon: Megaphone },
  ];

  return (
    // 🚀 เพิ่ม print:bg-white และ print:h-auto เพื่อให้กระดาษปรินต์เป็นสีขาวและเลื่อนได้หลายหน้า
    <div className="flex h-screen bg-slate-50 font-sans print:bg-white print:h-auto">
      
      {/* Sidebar สุดล้ำ */}
      <motion.div 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        // 🚀 เพิ่ม print:hidden ตรงบรรทัดด้านล่างนี้ เพื่อซ่อนเมนูตอนกดปริ้นต์
        className="w-72 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl z-20 print:hidden"
      >
        <div className="p-8 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <QrCode size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider">TECCOM SIS</h1>
            <p className="text-xs text-blue-100 font-medium tracking-wide">TECHNOLOGY COMPUTER</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`relative flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                  isActive ? "text-white font-medium" : "hover:text-white hover:bg-slate-800/50"
                }`}>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl -z-10 shadow-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400 transition-colors"} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-red-500/90 text-slate-300 hover:text-white p-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-red-500/25 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </motion.div>

      {/* พื้นที่แสดงเนื้อหาหลัก */}
      {/* 🚀 เพิ่ม print:overflow-visible เพื่อให้เนื้อหาที่ยาวเกิน 1 หน้ากระดาษไม่ถูกตัดทิ้ง */}
      <div className="flex-1 flex flex-col overflow-hidden relative print:overflow-visible">
        {/* 🚀 เพิ่ม print:p-0 เพื่อลบระยะขอบ Padding ตอนปริ้นต์ */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 lg:p-12 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}