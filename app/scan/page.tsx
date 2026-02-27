"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Clock } from "lucide-react";

// สร้าง Component แยกไว้เผื่อใช้งานร่วมกับ Suspense
function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("กำลังตรวจสอบข้อมูล...");
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const processScan = async () => {
      // 1. ดึงวันที่จาก QR Code (URL)
      const qrDate = searchParams.get("date");
      if (!qrDate) {
        setStatus("error");
        setMessage("QR Code ไม่ถูกต้อง");
        return;
      }

      // 2. เช็คว่านักเรียนล็อกอินในมือถือหรือยัง
      const session = await getSession();
      if (!session || !session.user) {
        setStatus("error");
        setMessage("กรุณาเข้าสู่ระบบก่อนทำการสแกนเช็คชื่อ");
        setTimeout(() => router.push("/login"), 3000); // เด้งไปหน้าล็อกอินอัตโนมัติ
        return;
      }

      if (session.user.role !== "STUDENT") {
        setStatus("error");
        setMessage("เฉพาะนักเรียนเท่านั้นที่สามารถเช็คชื่อได้");
        return;
      }

      // 3. ส่งข้อมูลไปบันทึก
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            date: qrDate, 
            studentId: session.user.id 
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          setIsLate(data.status === "LATE");
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch (error) {
        setStatus("error");
        setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      }
    };

    processScan();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={64} />
            <h2 className="text-xl font-bold text-slate-700">กำลังบันทึกข้อมูล...</h2>
            <p className="text-slate-500 mt-2">กรุณารอสักครู่</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              {isLate ? (
                <Clock className="text-orange-500 mb-4" size={80} />
              ) : (
                <CheckCircle2 className="text-emerald-500 mb-4" size={80} />
              )}
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2 ${isLate ? "text-orange-600" : "text-emerald-600"}`}>
              {message}
            </h2>
            <p className="text-slate-500">บันทึกข้อมูลลงระบบเรียบร้อยแล้ว</p>
            <button 
              onClick={() => router.push("/login")}
              className="mt-8 bg-slate-800 text-white px-6 py-2 rounded-xl"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <AlertCircle className="text-red-500 mb-4" size={80} />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">ข้อผิดพลาด!</h2>
            <p className="text-slate-600 font-medium">{message}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>}>
      <ScanContent />
    </Suspense>
  );
}