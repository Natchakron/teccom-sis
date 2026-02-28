import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, password } = body;

    if (!id) {
      return NextResponse.json({ error: "ไม่พบ ID ของผู้ใช้งาน" }, { status: 400 });
    }

    // เตรียมข้อมูลที่จะอัปเดต
    const updateData: any = {
      firstName: firstName,
      lastName: lastName,
    };

    // ถ้าแอดมินพิมพ์รหัสผ่านใหม่เข้ามา ให้ทำการเข้ารหัส (Hash) ใหม่ด้วย
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // สั่งอัปเดตลงฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ message: "อัปเดตข้อมูลสำเร็จ!", user: updatedUser });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลได้" }, { status: 500 });
  }
}