import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // ให้ระบบเข้ารหัสคำว่า 123456 ด้วยตัวเอง (ชัวร์ 100%)
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    // สร้างหรืออัปเดตข้อมูลแอดมิน คุณ Natchakron Thongtem
    const user = await prisma.user.upsert({
      where: { code: "ADMIN01" },
      update: { password: hashedPassword },
      create: {
        id: "admin-001",
        code: "ADMIN01",
        password: hashedPassword,
        firstName: "Natchakron",
        lastName: "Thongtem",
        role: "ADMIN",
      }
    });
    
    return NextResponse.json({ message: "สร้าง Admin สำเร็จ 100%!", user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}