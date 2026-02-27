import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงข้อมูลการตั้งค่า
export async function GET() {
  try {
    let setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });
    
    // ถ้าเพิ่งเปิดระบบครั้งแรกและยังไม่มีข้อมูล ให้สร้างค่าเริ่มต้น
    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: { id: 1, isMorningScanOn: false, scanStartTime: "07:50", scanEndTime: "08:30" }
      });
    }
    
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// อัปเดตการตั้งค่า (เปิด/ปิด และ ตั้งเวลา)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { isMorningScanOn, scanStartTime, scanEndTime } = body;
    
    const updatedSetting = await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: { isMorningScanOn, scanStartTime, scanEndTime },
      create: { id: 1, isMorningScanOn, scanStartTime, scanEndTime }
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    return NextResponse.json({ error: "อัปเดตข้อมูลล้มเหลว" }, { status: 500 });
  }
}