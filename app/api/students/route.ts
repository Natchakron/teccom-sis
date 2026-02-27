import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ฟังก์ชัน GET: ดึงรายชื่อนักเรียนทั้งหมด
export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { code: "asc" }, // เรียงตามรหัสนักศึกษา
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// ฟังก์ชัน POST: เพิ่มนักเรียนใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, firstName, lastName, password } = body;

    // เช็คก่อนว่ารหัสนักศึกษานี้มีในระบบหรือยัง
    const existingUser = await prisma.user.findUnique({ where: { code } });
    if (existingUser) {
      return NextResponse.json({ error: "รหัสประจำตัวนี้มีในระบบแล้ว" }, { status: 400 });
    }

    // เข้ารหัสผ่านให้ปลอดภัยก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await prisma.user.create({
      data: {
        code,
        firstName,
        lastName,
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เพิ่มข้อมูลล้มเหลว" }, { status: 500 });
  }
}