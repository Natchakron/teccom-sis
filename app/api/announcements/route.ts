import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ดึงประกาศทั้งหมด (เรียงจากใหม่ไปเก่า)
export async function GET() {
  try {
    const news = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// สร้างประกาศใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, type } = body;

    const news = await prisma.announcement.create({
      data: { title, content, type }
    });

    return NextResponse.json({ message: "สร้างประกาศสำเร็จ", news }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// ลบประกาศ
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (id) {
      await prisma.announcement.delete({ where: { id } });
    }
    return NextResponse.json({ message: "ลบประกาศสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ error: "ลบข้อมูลล้มเหลว" }, { status: 500 });
  }
}