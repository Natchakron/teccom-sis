import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startCode, endCode, subjectId, term } = body;

    // 1. ค้นหานักเรียนทั้งหมดที่มีรหัสอยู่ในช่วงนี้
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        code: {
          gte: startCode,
          lte: endCode,
        }
      },
      select: { id: true, code: true }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: "ไม่พบรหัสนักเรียนในช่วงที่ระบุ" }, { status: 404 });
    }

    let successCount = 0;

    // 2. ใช้ท่าไม้ตาย: วนลูปจับนักเรียนใส่ทีละคน เพื่อป้องกัน Error จากฐานข้อมูล
    for (const student of students) {
      try {
        // เช็คก่อนว่าเด็กคนนี้เคยลงทะเบียนวิชานี้ไปหรือยัง จะได้ไม่ซ้ำ
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: { 
            studentId: student.id, 
            subjectId: subjectId 
          }
        });

        // ถ้ายังไม่เคยลงวิชานี้ ค่อยบันทึกใหม่
        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              studentId: student.id,
              subjectId: subjectId,
              term: term || "1/2569",
              // หมายเหตุ: เอา gradeResult ออกไปก่อน เพราะใน schema อาจจะไม่มีฟิลด์นี้
            }
          });
          successCount++;
        }
      } catch (innerError) {
        console.error(`ไม่สามารถบันทึกเด็ก ${student.code} ได้:`, innerError);
      }
    }

    return NextResponse.json({ 
      message: `นำนักเรียนเข้าวิชาสำเร็จ ${successCount} คน (จากที่พบทั้งหมด ${students.length} คน)` 
    });

  } catch (error: any) {
    console.error("Bulk Enroll Error:", error);
    // ✨ อัปเกรดระบบ Error ให้คายคำพูดของจริงออกมา จะได้รู้ว่าพังเพราะอะไร!
    return NextResponse.json({ error: `ระบบขัดข้อง: ${error.message}` }, { status: 500 });
  }
}