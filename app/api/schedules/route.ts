import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (studentId) {
      // ถ้านักเรียนขอข้อมูล: ให้ไปหาว่าลงทะเบียนวิชาอะไรบ้าง แล้วดึงตารางของวิชานั้นๆ มา
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        select: { subjectId: true }
      });
      const subjectIds = enrollments.map(e => e.subjectId);

      const schedules = await prisma.classSchedule.findMany({
        where: { subjectId: { in: subjectIds } },
        include: { subject: true },
      });
      return NextResponse.json(schedules);
    } else {
      // ถ้าแอดมินขอข้อมูล: ดึงตารางทั้งหมด
      const schedules = await prisma.classSchedule.findMany({
        include: { subject: true },
        orderBy: [ { dayOfWeek: 'asc' }, { startTime: 'asc' } ]
      });
      return NextResponse.json(schedules);
    }
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectId, dayOfWeek, startTime, endTime, room } = body;

    const schedule = await prisma.classSchedule.create({
      data: { subjectId, dayOfWeek, startTime, endTime, room }
    });

    return NextResponse.json({ message: "เพิ่มตารางสอนสำเร็จ", schedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}