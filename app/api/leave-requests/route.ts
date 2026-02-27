import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendLeaveEmail } from "@/lib/mail";

// ดึงประวัติการลา
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (studentId) {
      const leaves = await prisma.leaveRequest.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(leaves);
    } else {
      const leaves = await prisma.leaveRequest.findMany({
        include: { student: true },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(leaves);
    }
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// ส่งใบลาใหม่ พร้อมส่ง Email แจ้งเตือน
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, startDate, endDate, reason } = body;

    // 1. บันทึกใบลาลงฐานข้อมูล
    const leave = await prisma.leaveRequest.create({
      data: {
        studentId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      }
    });

    // 2. ดึงข้อมูลนักเรียนเพื่อเอาชื่อและรหัสไปใส่ในเมล
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    // 3. สั่งส่ง Email ทันที
    if (student) {
      await sendLeaveEmail({
        studentName: `${student.firstName} ${student.lastName}`,
        studentCode: student.code,
        reason: reason,
        startDate: new Date(startDate).toLocaleDateString('th-TH'),
        endDate: new Date(endDate).toLocaleDateString('th-TH'),
      });
    }

    return NextResponse.json({ message: "ส่งคำขอลาหยุดสำเร็จและส่งเมลแจ้งเตือนแล้ว", leave }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "บันทึกข้อมูลล้มเหลว" }, { status: 500 });
  }
}

// อัปเดตสถานะ (อนุมัติ/ไม่อนุมัติ) สำหรับแอดมิน
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json({ message: "อัปเดตสถานะสำเร็จ", leave });
  } catch (error) {
    return NextResponse.json({ error: "อัปเดตล้มเหลว" }, { status: 500 });
  }
}