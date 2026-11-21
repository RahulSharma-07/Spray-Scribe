import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  logger: {
    error(error) {
      console.error("[AUTH ERROR]", error.name, error.message);
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim();
        const password = (credentials.password as string).trim();

        console.log("AUTHORIZE CALL: ", email);

        // Check for super admin credentials from environment variables
        const admins = [
          {
            email: process.env.ADMIN_1_EMAIL,
            password: process.env.ADMIN_1_PASSWORD,
            name: process.env.ADMIN_1_NAME ?? "Super Admin",
          },
          {
            email: process.env.ADMIN_2_EMAIL,
            password: process.env.ADMIN_2_PASSWORD,
            name: process.env.ADMIN_2_NAME ?? "Admin",
          },
        ];

        const matchedAdmin = admins.find(
          (a) => a.email && a.password && email === a.email && password === a.password
        );

        if (matchedAdmin) {
          console.log("Super admin login - creating/fetching admin user");
          try {
            let user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
              const hashedPassword = await bcrypt.hash(password, 10);
              user = await prisma.user.create({
                data: {
                  email,
                  name: matchedAdmin.name,
                  password: hashedPassword,
                  role: "ADMIN",
                  credits: 999999,
                  plan: "PRO",
                },
              });
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
              credits: user.credits,
              plan: user.plan,
            };
          } catch (dbError) {
            // DB unavailable — return a session-only admin token so login still works
            console.error("[AUTH] DB error during admin login, using fallback:", dbError);
            return {
              id: `admin-${email}`,
              email,
              name: matchedAdmin.name,
              image: null,
              role: "ADMIN",
              credits: 999999,
              plan: "PRO",
            };
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log("User found in DB:", !!user);

        if (!user || !user.password) {
           console.log("User missing");
           return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        console.log("Password valid via bcrypt:", isValid);

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          credits: user.credits,
          plan: user.plan,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.credits = (user as any).credits;
        token.plan = (user as any).plan;
        token.name = user.name;
      }

      // On every token refresh, re-sync the real DB user ID using email
      // This fixes stale token IDs after DB migrations
      if (!user && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true, credits: true, plan: true, name: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.credits = dbUser.credits;
            token.plan = dbUser.plan;
            token.name = dbUser.name;
          }
        } catch { /* DB unavailable, keep existing token */ }
      }

      if (trigger === "update" && session) {
        token.credits = session.credits;
        token.plan = session.plan;
        token.name = session.name;
        token.image = session.image;
        if (session.role) token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).credits = token.credits;
        (session.user as any).plan = token.plan;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Assign default credits on signup — wrapped in try/catch so DB errors don't break auth
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: 10, apiKey: crypto.randomUUID() },
        });
      } catch (error) {
        console.error("[AUTH] Failed to initialize user credits:", error);
      }
    },
  },
});
