"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react"; 
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Monitor, Lock, User as UserIcon, ArrowRight, Loader2, AlertOctagon } from "lucide-react";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // เช็คว่าถ้าล็อกอินอยู่แล้ว ให้เด้งไปหน้าหลัก (/) เลยไม่ต้องล็อกอินซ้ำ
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // เรียกใช้ระบบ Login ของ NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      code,
      password,
    });

    if (res?.error) {
      setError("รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    } else {
      router.push("/"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* พื้นหลังแสงสี (Glow Background) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute top-[40%] left-[40%] w-72 h-72 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
      
      {/* การ์ด Login (Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 text-white mx-4"
      >
        {/* ส่วนหัวของฟอร์ม */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5"
          >
            <Monitor size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">TECCOM SIS</h1>
          <p className="text-blue-200 text-sm font-medium tracking-wide">
            แผนกเทคโนโลยีคอมพิวเตอร์ วิทยาลัยเทคนิคชัยนาท
          </p>
        </div>

        {/* กล่องแจ้งเตือน Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-rose-500/20 border border-rose-500/50 text-rose-200 p-4 rounded-xl mb-6 text-sm text-center flex items-center justify-center gap-2"
          >
            <AlertOctagon size={18} /> {error}
          </motion.div>
        )}

        {/* ฟอร์มเข้าสู่ระบบ */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5 ml-1">
              รหัสประจำตัว
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300 group-focus-within:text-blue-400 transition-colors">
                <UserIcon size={20} />
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black/40 text-white placeholder-blue-300/40 transition-all text-sm sm:text-base"
                placeholder="กรอกรหัสประจำตัวของคุณ"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5 ml-1">
              รหัสผ่าน
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-black/40 text-white placeholder-blue-300/40 transition-all text-sm sm:text-base"
                placeholder="กรอกรหัสผ่านของคุณ"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-70 mt-8 font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <><Loader2 size={20} className="animate-spin" /> กำลังตรวจสอบข้อมูล...</>
            ) : (
              <>เข้าสู่ระบบ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}