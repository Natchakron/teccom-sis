import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🌟 เพิ่มฟังก์ชัน GET สำหรับดึงรูปภาพล่าสุดตอนโหลดหน้าเว็บ
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true } // ดึงมาแค่รูปภาพ จะได้โหลดไวๆ
      });
      return NextResponse.json(user);
    }
    return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// ฟังก์ชัน POST สำหรับอัปโหลดรูป (อันเดิม)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, imageBase64 } = body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: imageBase64 }
    });

    return NextResponse.json({ message: "อัปโหลดรูปสำเร็จ", image: user.image });
  } catch (error) {
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}