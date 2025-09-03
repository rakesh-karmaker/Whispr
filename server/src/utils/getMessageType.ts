export default function getMessageType(
  hasImage: boolean,
  hasFile: boolean,
  hasLink: boolean
): "text" | "image" | "file" | "link" | "hybrid" {
  if (hasImage) {
    return hasFile || hasLink ? "hybrid" : "image";
  } else if (hasFile) {
    return hasImage || hasLink ? "hybrid" : "file";
  } else if (hasLink) {
    return hasImage || hasFile ? "hybrid" : "link";
  } else {
    return "text";
  }
}
