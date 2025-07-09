import { verifyJWTToken } from "@/utils/JWTToken.js";
import { NextFunction, Request, Response } from "express";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send("You are not authenticated!");
      return;
    }

    const payload = verifyJWTToken(token);

    if (
      typeof payload === "string" ||
      !payload ||
      typeof payload.id !== "string"
    ) {
      res.status(403).send("Invalid token");
      return;
    }

    req.userId = payload.id;
    next();
  } catch (err) {
    console.log(err);
    res.status(403).send("Invalid token");
  }
}
