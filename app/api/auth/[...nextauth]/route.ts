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
        token.role = user.role;
        token.code = user.code;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.code = token.code as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // เดี๋ยวเราจะไปสร้างหน้า Login สวยๆ กันที่นี่
  }
});

export { handler as GET, handler as POST };