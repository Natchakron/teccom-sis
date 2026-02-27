import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // แกะรหัสนักเรียนจาก URL
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "ไม่พบรหัสนักเรียน" }, { status: 400 });
    }

    // ดึงเกรดทั้งหมดของนักเรียนคนนี้ (ดึงข้อมูลวิชาและเทอมมาด้วย)
    const grades = await prisma.grade.findMany({
      where: { 
        enrollment: { studentId: studentId } 
      },
      include: {
        enrollment: {
          include: { subject: true }
        }
      },
      orderBy: { enrollment: { term: "desc" } } // เรียงเทอมล่าสุดขึ้นก่อน
    });

    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลเกรดล้มเหลว" }, { status: 500 });
  }
}