import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // แกะเอา studentId ที่แนบมากับ URL
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "ไม่พบรหัสนักเรียน" }, { status: 400 });
    }

    // ดึงข้อมูลการเข้าแถวของนักเรียนคนนี้ 5 วันล่าสุด
    const records = await prisma.morningAttendance.findMany({
      where: { studentId: studentId },
      orderBy: { date: "desc" },
      take: 5,
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}