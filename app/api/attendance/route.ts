import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // ดึงประวัติการสแกนทั้งหมด เรียงจากเวลาล่าสุดไปเก่าสุด
    const records = await prisma.morningAttendance.findMany({
      include: {
        student: {
          select: {
            code: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        timeIn: 'desc'
      }
    });
    
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}