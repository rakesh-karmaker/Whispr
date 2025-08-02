export default function filterPublicId(publicId: string): string {
  // Check if the publicId is a valid string
  if (typeof publicId !== "string" || publicId.trim() === "") {
    throw new Error("Invalid publicId provided");
  }

  // Extract the part of the publicId before the first hyphen
  const parts = publicId.split("-");
  return parts.length > 1 ? parts.slice(0, -1).join("-") : publicId;
}
