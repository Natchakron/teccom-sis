import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงข้อมูลรายวิชาทั้งหมด (พร้อมดึงชื่ออาจารย์ผู้สอนมาด้วย)
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { subjectCode: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// เพิ่มรายวิชาใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subjectCode, name, credit, teacherId } = body;

    // เช็คว่ารหัสวิชาซ้ำไหม
    const existingSubject = await prisma.subject.findUnique({ where: { subjectCode } });
    if (existingSubject) {
      return NextResponse.json({ error: "รหัสวิชานี้มีในระบบแล้ว" }, { status: 400 });
    }

    const newSubject = await prisma.subject.create({
      data: {
        subjectCode,
        name,
        credit: parseInt(credit), // แปลงหน่วยกิตให้เป็นตัวเลข
        teacherId,
      },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เพิ่มข้อมูลล้มเหลว" }, { status: 500 });
  }
}