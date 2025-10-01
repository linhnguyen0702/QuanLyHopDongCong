// Global type declarations
import NextAuth from "next-auth";

// NextAuth type declarations
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      company?: string;
      role?: string;
      department?: string | null;
      phone?: string | null;
      createdAt?: string;
      isRegistered?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    company?: string;
    role?: string;
    department?: string | null;
    phone?: string | null;
    createdAt?: string;
    isRegistered?: boolean;
  }
}
