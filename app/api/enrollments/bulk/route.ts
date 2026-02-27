import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startCode, endCode, subjectId, term } = body;

    // 1. หาเด็กทั้งหมดที่รหัสอยู่ในช่วงที่กำหนด
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        code: { gte: startCode, lte: endCode }
      },
      select: { id: true, code: true }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "ไม่พบรหัสนักเรียนในช่วงที่ระบุ" }, { status: 404 });
    }

    // 2. จับเด็กทุกคนมาผูกกับรายวิชานี้
    const enrollmentsData = students.map(student => ({
      studentId: student.id,
      subjectId: subjectId,
      term: term || "1/2569",
      gradeResult: "", 
    }));

    // 3. บันทึกลงฐานข้อมูล (skipDuplicates จะข้ามคนที่เคยลงทะเบียนวิชานี้ไปแล้ว)
    const result = await prisma.enrollment.createMany({
      data: enrollmentsData,
      skipDuplicates: true, 
    });

    return NextResponse.json({ 
      message: `นำนักเรียนเข้าวิชาสำเร็จ ${result.count} คน (จากทั้งหมด ${students.length} คน)`,
    });

  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}