export default function filterPublicId(publicId: string): string {
  // Check if the publicId is a valid string
  if (typeof publicId !== "string" || publicId.trim() === "") {
    throw new Error("Invalid publicId provided");
  }

  // Extract the part of the publicId before the first hyphen
  const parts = publicId.split("-");
  const prefixedFilteredId =
    parts.length > 1 ? parts.slice(1, -1).join("-") : publicId;
  // Extract the last part after the last hyphen
  const lastPart = parts[parts.length - 1];
  if (lastPart.includes(".")) {
    // If the last part contains a dot, split it and return the first part
    return prefixedFilteredId;
  } else {
    // remove the last part from the prefixedFilteredId
    return prefixedFilteredId.replace(`-${lastPart}`, "");
  }
}
