import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startCode, endCode, subjectId, term } = body;

    // 1. ค้นหานักเรียนที่มีรหัสในช่วงที่ระบุ
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        code: { gte: startCode, lte: endCode }
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "ไม่พบรหัสนักเรียนในช่วงรหัสที่ระบุ" }, { status: 404 });
    }

    let successCount = 0;
    let skipCount = 0;

    // 2. วนลูปเช็คและสร้าง Enrollment ทีละคน
    for (const student of students) {
      // ตรวจสอบก่อนว่าเคยลงทะเบียนวิชานี้ในเทอมนี้ไปหรือยัง (ป้องกัน @@unique error)
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_subjectId_term: {
            studentId: student.id,
            subjectId: subjectId,
            term: term
          }
        }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            subjectId: subjectId,
            term: term
          }
        });
        successCount++;
      } else {
        skipCount++;
      }
    }

    return NextResponse.json({ 
      message: `สำเร็จ! ลงทะเบียนใหม่ ${successCount} คน (ข้ามคนที่เคยลงแล้ว ${skipCount} คน)` 
    });

  } catch (error: any) {
    console.error("Enroll Error:", error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาด: ${error.message}` }, { status: 500 });
  }
}