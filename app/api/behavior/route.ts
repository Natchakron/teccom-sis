import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงข้อมูลนักเรียนพร้อมคะแนนความประพฤติปัจจุบัน
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (studentId) {
      // ดึงประวัติของนักเรียนคนเดียว
      const records = await prisma.behaviorRecord.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(records);
    } else {
      // ดึงนักเรียนทั้งหมด พร้อมคำนวณคะแนนปัจจุบันให้แอดมินดู
      const students = await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: { behaviorRecords: true },
        orderBy: { code: "asc" }
      });
      
      const studentsWithPoints = students.map(st => {
        // ทุกคนเริ่มที่ 100 คะแนน แล้วเอาประวัติทั้งหมดมาบวกลบ
        const totalChange = st.behaviorRecords.reduce((sum, rec) => sum + rec.points, 0);
        return {
          ...st,
          currentPoints: 100 + totalChange // คะแนนสุทธิ
        };
      });

      return NextResponse.json(studentsWithPoints);
    }
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// บันทึกการหัก/เพิ่มคะแนน
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, points, reason } = body;

    if (!studentId || !points || !reason) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const record = await prisma.behaviorRecord.create({
      data: {
        studentId,
        points: parseInt(points), // แปลงเป็นตัวเลข (บวกหรือลบ)
        reason
      }
    });

    return NextResponse.json({ message: "บันทึกข้อมูลสำเร็จ", record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}