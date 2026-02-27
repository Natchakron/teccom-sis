import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendLeaveEmail(data: {
  studentName: string;
  studentCode: string;
  reason: string;
  startDate: string;
  endDate: string;
}) {
  const mailOptions = {
    from: `"TECCOM SIS" <${process.env.EMAIL_SERVER_USER}>`,
    to: process.env.EMAIL_ADMIN_RECEIVE,
    subject: `📢 แจ้งลาหยุดใหม่: ${data.studentName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>มีการแจ้งลาหยุดใหม่จากนักศึกษา</h2>
        <p><strong>นักศึกษา:</strong> ${data.studentName} (${data.studentCode})</p>
        <p><strong>เหตุผลการลา:</strong> ${data.reason}</p>
        <p><strong>ช่วงเวลา:</strong> ${data.startDate} ถึง ${data.endDate}</p>
        <hr />
        <p style="font-size: 12px; color: #777;">ส่งอัตโนมัติจากระบบ TECCOM SIS วิทยาลัยเทคนิคชัยนาท</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false };
  }
}