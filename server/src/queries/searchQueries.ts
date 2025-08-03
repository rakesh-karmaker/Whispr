import { Request } from "express";
import User from "../models/User.js";

export async function searchContactsQuery(
  searchTerm: string | undefined,
  pageNumber: number,
  req: Request
) {
  const sanitizedSearchTerm = (searchTerm as string).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const includesRegex = new RegExp(sanitizedSearchTerm, "i");

  const allUsers = await User.find({
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
    .skip((pageNumber - 1) * 10);

  return allUsers;
}
