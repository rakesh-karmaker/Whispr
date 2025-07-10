import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";

export async function searchContacts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { searchTerm } = req.body;
    console.log("searchTerm", searchTerm);
    if (!searchTerm) {
      res.status(400).send({ message: "Please provide a search term" });
      return;
    }

    const sanitizedSearchTerm = searchTerm.replace(
      "/[.*+?^${}()|[\]\\]/g",
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Search for contacts except for the current user
    const contacts = await User.find({
      $and: [
        {
          _id: { $ne: req.userId },
        },
        {
          $or: [
            {
              name: { $regex: regex },
            },
            {
              firstName: { $regex: regex },
            },
            {
              lastName: { $regex: regex },
            },
            {
              email: { $regex: regex },
            },
          ],
        },
      ],
    }).select("name firstName lastName email avatar isActive");

    // Remove duplicates
    res.status(200).send([...new Set(contacts)]);
  } catch (err) {
    console.log("Error searching contacts - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
