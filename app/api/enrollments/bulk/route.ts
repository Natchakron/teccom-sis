import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startCode, endCode, subjectId, term } = body;

    // 1. ค้นหานักเรียนทั้งหมดที่มีรหัสประจำตัว (code) อยู่ในช่วงที่กำหนด
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        code: {
          gte: startCode, // มากกว่าหรือเท่ากับ รหัสเริ่มต้น
          lte: endCode,   // น้อยกว่าหรือเท่ากับ รหัสสิ้นสุด
        }
      },
      select: { id: true, code: true }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "ไม่พบนักเรียนในช่วงรหัสที่ระบุ" }, { status: 404 });
    }

    // 2. จับคู่รหัสนักเรียนเข้ากับรายวิชา
    const enrollmentsData = students.map(student => ({
      studentId: student.id,
      subjectId: subjectId,
      term: term || "1/2569", // เทอมเริ่มต้น
      gradeResult: "", // ยังไม่มีเกรด
    }));

    // 3. บันทึกลงฐานข้อมูลทีเดียวทั้งกลุ่ม (skipDuplicates ป้องกันการลงวิชาซ้ำ)
    const result = await prisma.enrollment.createMany({
      data: enrollmentsData,
      skipDuplicates: true, 
    });

    return NextResponse.json({ 
      message: `ลงทะเบียนสำเร็จ ${result.count} คน จากที่พบทั้งหมด ${students.length} คน (ข้ามคนที่ลงซ้ำแล้ว)`,
      count: result.count 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลงทะเบียนกลุ่ม" }, { status: 500 });
  }
}