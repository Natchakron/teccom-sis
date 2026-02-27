import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        code: { label: "รหัสประจำตัว", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.code || !credentials?.password) {
          return null;
        }

        // ค้นหาผู้ใช้ในฐานข้อมูลจากรหัสประจำตัว
        const user = await prisma.user.findUnique({
          where: { code: credentials.code }
        });

        if (!user) {
          return null;
        }

        // ตรวจสอบรหัสผ่านว่าตรงกันไหม
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // ถ้าผ่านหมด ให้ส่งข้อมูลกลับไปที่ระบบ Login
        return {
          id: user.id,
          code: user.code,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 🚀 ใส่ (user as any) เพื่อสับขาหลอก Vercel ให้ยอมให้ผ่าน
        token.role = (user as any).role;
        token.code = (user as any).code;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // 🚀 ใส่ (session.user as any) ด้วย
        (session.user as any).role = token.role;
        (session.user as any).code = token.code;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});

export { handler as GET, handler as POST };