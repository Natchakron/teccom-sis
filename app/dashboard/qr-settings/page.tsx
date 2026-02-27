"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Settings, Power, Clock, CheckCircle2 } from "lucide-react";
import QRCode from "react-qr-code";

export default function QRSettingsPage() {
  const [settings, setSettings] = useState({ isMorningScanOn: false, scanStartTime: "07:50", scanEndTime: "08:30" });
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (data && !data.error) {
      setSettings(data);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // สร้าง QR Code ลิงก์ที่จะพานักเรียนไปหน้าสแกน (พร้อมแนบวันที่ปัจจุบันป้องกันการแคปรูปไปใช้วันอื่น)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // เช่น 2026-02-27
    const currentUrl = window.location.origin; // เช่น http://localhost:3000
    setQrValue(`${currentUrl}/scan?date=${today}`);
  }, [settings.isMorningScanOn]);

  const handleUpdate = async (newSettings: any) => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
    
    if (res.ok) {
      const updated = await res.json();
      setSettings(updated);
    }
    setLoading(false);
  };

  const toggleScan = () => {
    handleUpdate({ ...settings, isMorningScanOn: !settings.isMorningScanOn });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="inline-flex justify-center items-center p-4 bg-purple-100 rounded-full mb-4">
          <QrCode className="text-purple-600" size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">ระบบสแกนเข้าแผนกตอนเช้า</h1>
        <p className="text-slate-500 font-medium">ควบคุมการเปิด-ปิด และตั้งเวลาสำหรับการสแกน QR Code</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* แผงตั้งค่า */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings className="text-slate-400" /> ตั้งค่าระบบ
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-700">สถานะระบบสแกน</h3>
                <p className="text-sm text-slate-500">เปิดให้นักเรียนสแกนเข้าแถว</p>
              </div>
              <button 
                onClick={toggleScan}
                disabled={loading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.isMorningScanOn ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.isMorningScanOn ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock size={16} /> เวลาเริ่มสแกน
                </label>
                <input 
                  type="time" 
                  value={settings.scanStartTime}
                  onChange={(e) => setSettings({...settings, scanStartTime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock size={16} /> เวลาสิ้นสุด (สาย)
                </label>
                <input 
                  type="time" 
                  value={settings.scanEndTime}
                  onChange={(e) => setSettings({...settings, scanEndTime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <button 
              onClick={() => handleUpdate(settings)}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-slate-800/20"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกเวลา"}
            </button>
          </div>
        </motion.div>

        {/* จอแสดง QR Code */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
          {settings.isMorningScanOn ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
              <div className="bg-emerald-50 text-emerald-600 inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm mb-6 border border-emerald-200">
                <CheckCircle2 size={16} /> ระบบกำลังเปิดรับสแกน
              </div>
              <div className="bg-white p-4 rounded-3xl shadow-lg border-4 border-emerald-100 inline-block">
                <QRCode value={qrValue} size={256} className="rounded-xl" />
              </div>
              <p className="mt-6 text-slate-500 font-medium">ให้นักเรียนใช้มือถือสแกนเพื่อเช็คชื่อ</p>
              <p className="text-sm text-slate-400">วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            </motion.div>
          ) : (
            <div className="text-center text-slate-400">
              <Power size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-slate-500 mb-2">ระบบถูกปิดอยู่</h3>
              <p className="text-sm">กดสวิตช์เปิดระบบสแกนด้านซ้าย<br/>เพื่อแสดง QR Code ให้นักเรียน</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}