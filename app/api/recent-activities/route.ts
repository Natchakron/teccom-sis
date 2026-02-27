import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // บังคับให้โหลดข้อมูลใหม่เสมอ

export async function GET() {
  try {
    // 1. ดึงประกาศข่าวสาร 5 อันล่าสุด
    const announcements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    });

    // 2. ดึงใบลาหยุด 5 อันล่าสุด
    const leaves = await prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { student: true }
    });

    // 3. ดึงประวัติความประพฤติ 5 อันล่าสุด
    const behaviors = await prisma.behaviorRecord.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { student: true }
    });

    // จับข้อมูลทั้งหมดมายำรวมกัน และจัดฟอร์แมตให้อ่านง่าย
    let activities: any[] = [];

    announcements.forEach(a => {
      activities.push({
        id: `ann-${a.id}`,
        type: "ANNOUNCEMENT",
        title: "ประกาศข่าวสารใหม่",
        description: `หัวข้อ: ${a.title}`,
        time: a.createdAt,
      });
    });

    leaves.forEach(l => {
      activities.push({
        id: `leave-${l.id}`,
        type: "LEAVE",
        title: "ส่งคำขอลาหยุด",
        description: `${l.student.firstName} ${l.student.lastName} แจ้งลาเหตุผล: ${l.reason}`,
        time: l.createdAt,
      });
    });

    behaviors.forEach(b => {
      const isPositive = b.points > 0;
      activities.push({
        id: `beh-${b.id}`,
        type: isPositive ? "BEHAVIOR_ADD" : "BEHAVIOR_DEDUCT",
        title: isPositive ? "เพิ่มคะแนนความประพฤติ" : "หักคะแนนความประพฤติ",
        description: `${b.student.firstName} ${b.student.lastName} (${isPositive ? '+' : ''}${b.points} แต้ม) - ${b.reason}`,
        time: b.createdAt,
      });
    });

    // เรียงลำดับข้อมูลทั้งหมดจาก เวลาล่าสุด -> เก่าสุด
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // ส่งกลับไปแค่ 6 รายการล่าสุด เพื่อไม่ให้หน้าเว็บยาวเกินไป
    return NextResponse.json(activities.slice(0, 6));

  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}