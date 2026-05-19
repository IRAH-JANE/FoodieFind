import type { Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(req: AuthenticatedRequest, res: Response) {
  const body = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (existingUser) {
    res.status(409).json({
      success: false,
      message: "Email is already registered",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: "USER",
    },
  });

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: safeUser(user),
      accessToken,
    },
  });
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  const passwordIsValid = await bcrypt.compare(body.password, user.password);

  if (!passwordIsValid) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: safeUser(user),
      accessToken,
    },
  });
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
}
