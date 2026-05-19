import jwt, { type SignOptions } from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
};

function getAccessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is missing in .env");
  }

  return secret;
}

export function signAccessToken(payload: TokenPayload) {
  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, getAccessSecret(), options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getAccessSecret()) as TokenPayload;
}
