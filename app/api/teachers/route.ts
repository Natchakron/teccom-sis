import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ดึงรายชื่ออาจารย์ทั้งหมด
export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      orderBy: { code: "asc" }, // เรียงตามรหัสอาจารย์
    });
    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// เพิ่มอาจารย์ใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, firstName, lastName, password } = body;

    // เช็คว่ารหัสซ้ำไหม
    const existingUser = await prisma.user.findUnique({ where: { code } });
    if (existingUser) {
      return NextResponse.json({ error: "รหัสประจำตัวนี้มีในระบบแล้ว" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await prisma.user.create({
      data: {
        code,
        firstName,
        lastName,
        password: hashedPassword,
        role: "TEACHER", // สำคัญมาก! กำหนดสิทธิ์เป็น TEACHER
      },
    });

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เพิ่มข้อมูลล้มเหลว" }, { status: 500 });
  }
}