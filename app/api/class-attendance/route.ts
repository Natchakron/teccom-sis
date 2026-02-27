import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงรายชื่อเด็กที่ลงเรียน + ประวัติเช็คชื่อของวันที่เลือก
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const dateStr = searchParams.get("date");

    if (!subjectId || !dateStr) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const targetDate = new Date(dateStr);

    // ดึงข้อมูลการลงทะเบียนเรียน พร้อมประวัติเช็คชื่อในวันนั้น (ถ้าเคยเช็คแล้ว)
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId: subjectId },
      include: {
        student: true,
        classChecks: {
          where: { date: targetDate }
        }
      },
      orderBy: { student: { code: 'asc' } } // เรียงตามรหัสนักศึกษา
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// บันทึกผลการเช็คชื่อ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, attendanceData } = body; 
    const targetDate = new Date(date);

    // 1. ลบของเดิมในวันนั้นทิ้งก่อน (เฉพาะรายวิชานี้) เพื่อป้องกันข้อมูลซ้ำซ้อนเวลามากดแก้
    const enrollmentIds = attendanceData.map((a: any) => a.enrollmentId);
    await prisma.classAttendance.deleteMany({
      where: {
        date: targetDate,
        enrollmentId: { in: enrollmentIds }
      }
    });

    // 2. บันทึกข้อมูลเช็คชื่อใหม่ทั้งหมด
    const createData = attendanceData.map((item: any) => ({
      date: targetDate,
      status: item.status,
      enrollmentId: item.enrollmentId
    }));

    await prisma.classAttendance.createMany({ data: createData });

    return NextResponse.json({ message: "บันทึกการเข้าเรียนสำเร็จ" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}