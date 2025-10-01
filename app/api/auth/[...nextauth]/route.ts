import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Function to check if email exists in database
async function checkEmailExists(email: string) {
  try {
    console.log(`🔎 Checking email in database: ${email}`);

    // Call the backend API to check email
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiUrl}/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❌ Email ${email} not found in database`);
        return {
          success: false,
          message: "Email chưa được đăng ký trong hệ thống",
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      console.log(`✅ Email ${email} found in database:`, data.data);
      return {
        success: true,
        message: "Email exists in system",
        data: data.data,
      };
    } else {
      console.log(`❌ Email ${email} not registered in system`);
      return {
        success: false,
        message: data.message || "Email chưa được đăng ký trong hệ thống",
      };
    }
  } catch (error) {
    console.error(`❌ Error checking email ${email}:`, error);

    // Fallback to mock data if API is not available
    console.log("🔄 API not available, falling back to mock data");
    return checkEmailExistsMock(email);
  }
}

// Fallback mock function when API is not available
function checkEmailExistsMock(email: string) {
  const allowedEmails = [
    {
      email: "linhyang0702@gmail.com",
      data: {
        id: 1,
        fullName: "Linh Nguyễn",
        email: "linhyang0702@gmail.com",
        company: "ABC Construction Company",
        role: "manager",
        department: "Project Management",
        phone: "+84123456789",
        createdAt: "2024-01-15T08:30:00.000Z",
      },
    },
    {
      email: "admin@example.com",
      data: {
        id: 2,
        fullName: "System Admin",
        email: "admin@example.com",
        company: "System",
        role: "admin",
        department: "IT",
        phone: "+84987654321",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    },
  ];

  const userInfo = allowedEmails.find((user) => user.email === email);

  if (userInfo) {
    console.log(`✅ Email ${email} found in mock data`);
    return {
      success: true,
      message: "Email exists in system",
      data: userInfo.data,
    };
  } else {
    console.log(`❌ Email ${email} not found in mock data`);
    return {
      success: false,
      message: "Email chưa được đăng ký trong hệ thống",
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("🔍 SignIn callback triggered:", {
        provider: account?.provider,
        email: user.email,
        name: user.name,
      });

      // Chỉ kiểm tra cho Google OAuth
      if (account?.provider === "google" && user.email) {
        try {
          console.log(`🔎 Checking email: ${user.email}`);
          const emailCheck = await checkEmailExists(user.email);

          if (!emailCheck.success) {
            // Email chưa được đăng ký - từ chối đăng nhập
            console.log(
              `❌ Email ${user.email} not registered - blocking login`
            );
            return "/login?error=EmailNotRegistered";
          }

          console.log(
            `✅ Email ${user.email} found in system - allowing login`
          );
          return true;
        } catch (error) {
          console.error("❌ Error during sign in check:", error);
          return "/login?error=SystemError";
        }
      }

      // Cho phép đăng nhập với các provider khác
      return true;
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        // Lấy thông tin người dùng từ database dựa trên email
        try {
          console.log(
            `🔎 Session callback [${new Date().toISOString()}] - Getting user data for: ${
              token.email
            }`
          );
          const emailCheck = await checkEmailExists(token.email as string);

          if (emailCheck.success && emailCheck.data) {
            // Cập nhật thông tin từ database
            console.log(
              `✅ Loading user data for ${token.email}:`,
              emailCheck.data
            );
            session.user.id = emailCheck.data.id.toString();
            session.user.name = emailCheck.data.fullName;
            session.user.email = emailCheck.data.email;
            // Thêm các thông tin bổ sung
            (session.user as any).company = emailCheck.data.company;
            (session.user as any).role = emailCheck.data.role;
            (session.user as any).department = emailCheck.data.department;
            (session.user as any).phone = emailCheck.data.phone;
            (session.user as any).createdAt = emailCheck.data.createdAt;
            (session.user as any).isRegistered = true;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
