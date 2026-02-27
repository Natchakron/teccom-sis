import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "ไม่พบข้อมูลนักเรียน กรุณาเข้าสู่ระบบใหม่" }, { status: 401 });
    }

    // 1. ดึงข้อมูลการตั้งค่าระบบ (เช็คว่าแอดมินเปิดให้สแกนไหม)
    const setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });
    if (!setting || !setting.isMorningScanOn) {
      return NextResponse.json({ error: "ระบบสแกนยังไม่เปิดใช้งาน หรือปิดรับการสแกนแล้ว" }, { status: 400 });
    }

    // 2. ตรวจสอบวันที่ (ป้องกันการแคปรูป QR Code ของเมื่อวานมาสแกน)
    const today = new Date().toISOString().split("T")[0];
    if (date !== today) {
      return NextResponse.json({ error: "QR Code นี้หมดอายุหรือไม่ถูกต้อง" }, { status: 400 });
    }

    // 3. ตรวจสอบว่าวันนี้เช็คชื่อไปแล้วหรือยัง
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const existingRecord = await prisma.morningAttendance.findFirst({
      where: {
        studentId,
        date: { gte: startOfDay }
      }
    });

    if (existingRecord) {
      return NextResponse.json({ error: "คุณได้เช็คชื่อสำหรับวันนี้ไปแล้ว!" }, { status: 400 });
    }

    // 4. ตรวจสอบเวลา "มา" หรือ "สาย"
    const now = new Date();
    // แปลงเวลาปัจจุบันเป็น HH:MM เช่น "08:15"
    const currentTimeString = now.toTimeString().substring(0, 5); 

    let status = "PRESENT"; // ค่าเริ่มต้นคือ "มา"
    
    // ถ้าเวลาปัจจุบัน มากกว่า เวลาสิ้นสุด (scanEndTime) ให้ถือว่า "สาย"
    if (currentTimeString > setting.scanEndTime) {
      status = "LATE";
    }

    // 5. บันทึกลงฐานข้อมูล
    const record = await prisma.morningAttendance.create({
      data: {
        date: now,
        timeIn: now,
        status: status as any,
        studentId,
      }
    });

    return NextResponse.json({ 
      message: status === "PRESENT" ? "เช็คชื่อสำเร็จ (มาตรงเวลา)" : "เช็คชื่อสำเร็จ (มาสาย)", 
      status 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" }, { status: 500 });
  }
}