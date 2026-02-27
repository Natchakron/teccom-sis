import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. นับจำนวนนักเรียนทั้งหมด
    const studentCount = await prisma.user.count({
      where: { role: "STUDENT" },
    });

    // 2. นับจำนวนอาจารย์ทั้งหมด
    const teacherCount = await prisma.user.count({
      where: { role: "TEACHER" },
    });

    // 3. นับจำนวนคนที่สแกนเข้าแถว "วันนี้"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todayScans = await prisma.morningAttendance.count({
      where: {
        date: { gte: startOfDay },
      },
    });

    // 4. ดึงสถานะระบบ QR Code ว่าเปิดหรือปิดอยู่
    const setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });
    
    return NextResponse.json({
      studentCount,
      teacherCount,
      todayScans,
      qrStatus: setting?.isMorningScanOn ? "เปิดรับสแกน" : "ระบบถูกปิด",
      scanTime: setting ? `${setting.scanStartTime} - ${setting.scanEndTime}` : "รอตั้งค่า",
    });

  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}