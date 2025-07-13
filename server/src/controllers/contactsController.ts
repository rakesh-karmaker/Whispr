import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";

export async function searchContacts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { searchTerm, pageNumber } = req.query;
    if (!searchTerm || !pageNumber) {
      res.status(400).send({ message: "Please provide a search term" });
      return;
    }

    const sanitizedSearchTerm = (searchTerm as string).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const includesRegex = new RegExp(sanitizedSearchTerm, "i");

    const allContacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { name: { $regex: includesRegex } },
            { firstName: { $regex: includesRegex } },
            { lastName: { $regex: includesRegex } },
            { email: { $regex: includesRegex } },
          ],
        },
      ],
    })
      .select("name firstName lastName email avatar isActive")
      .limit(10)
      .skip(((pageNumber as unknown as number) - 1) * 10);

    const hasMore = allContacts.length === 10;

    res.status(200).send({
      contacts: allContacts,
      hasMore,
    });
  } catch (err) {
    console.log("Error searching contacts - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
