import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงข้อมูลเกรดทั้งหมดมาแสดงในตาราง
export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        enrollment: {
          include: {
            student: true,
            subject: true,
          }
        }
      },
      orderBy: { enrollment: { term: 'desc' } }
    });
    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// บันทึกเกรดให้นักเรียน
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, subjectId, term, gradeResult } = body;

    if (!studentId || !subjectId || !term || !gradeResult) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // 1. เช็คว่านักเรียนเคยลงทะเบียนวิชานี้ในเทอมนี้หรือยัง ถ้ายังให้สร้างใหม่
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId_term: {
          studentId,
          subjectId,
          term
        }
      }
    });

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: { studentId, subjectId, term }
      });
    }

    // 2. บันทึกหรืออัปเดตเกรด
    const grade = await prisma.grade.upsert({
      where: { enrollmentId: enrollment.id },
      update: { gradeResult },
      create: {
        enrollmentId: enrollment.id,
        gradeResult
      }
    });

    return NextResponse.json({ message: "บันทึกเกรดสำเร็จ", grade }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}