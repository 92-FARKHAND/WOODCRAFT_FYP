import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./db";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize attempt for:", credentials?.email);
        if (!credentials || !credentials.email || !credentials.password) {
          console.error("Authorize failed: Missing credentials");
          throw new Error("Missing email or password");
        }

        try {
          await dbConnect();

          const user = await User.findOne({
            email: credentials.email,
          }).select("+password"); 

          if (!user) {
            console.error("Authorize failed: No user found for", credentials.email);
            throw new Error("No user found with this email");
          }
           
          //use schema method instead of creating new one
          const isValid = await user.matchPassword(credentials.password);

           // const isValid = await bcrypt.compare(
          //   credentials.password,
          //   user.password
          // );

          if (!isValid) {
            console.error("Authorize failed: Invalid password for", credentials.email);
            throw new Error("Invalid password");
          }

          console.log("Authorize successful for:", credentials.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            contact: user.contact,
            status: user.status,
            workStatus: user.workStatus,
            hoursToPaid: user.hoursToPaid,
            totalTime: user.totalTime,
            hourlyRate: user.hourlyRate,
            skill: user.skill,
            createdAt: user.createdAt,
          };
        } catch (error) {
          console.error("Authorize error:", error.message);
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: set token data from user object
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.address = user.address;
        token.contact = user.contact;
        token.status = user.status;
        token.workStatus = user.workStatus;
        token.hoursToPaid = user.hoursToPaid;
        token.totalTime = user.totalTime;
        token.hourlyRate = user.hourlyRate;
        token.skill = user.skill;
        token.createdAt = user.createdAt;
        return token;
      }

      // Handle the "update" trigger or regular refresh: fetch latest from database
      // This ensures session stays in sync even after page reloads
      try {
        await dbConnect();
        const latestUser = await User.findById(token.id).lean();
        if (latestUser) {
          token.name = latestUser.name;
          token.email = latestUser.email;
          token.role = latestUser.role;
          token.address = latestUser.address;
          token.contact = latestUser.contact;
          token.status = latestUser.status;
          token.workStatus = latestUser.workStatus;
          token.hoursToPaid = latestUser.hoursToPaid;
          token.totalTime = latestUser.totalTime;
          token.hourlyRate = latestUser.hourlyRate;
          token.skill = latestUser.skill;
          token.createdAt = latestUser.createdAt;
         }
      } catch (error) {
        console.error("Error refreshing JWT from database:", error);
      }

      // If data was passed via update({ user: { ... } }), merge it too
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email; // Added email sync
        session.user.role = token.role;
        session.user.address = token.address;
        session.user.contact = token.contact;
        session.user.status = token.status;
        session.user.workStatus = token.workStatus;
        session.user.hoursToPaid = token.hoursToPaid;
        session.user.totalTime = token.totalTime;
        session.user.hourlyRate = token.hourlyRate;
        session.user.skill = token.skill;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },

  pages: {
    signIn: "/Auth",
    error: "/Auth",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};