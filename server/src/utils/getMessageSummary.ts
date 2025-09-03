import { SendMessageFunctionProps } from "../types/socketFunctionTypes.js";

export default function getMessageSummary(
  data: SendMessageFunctionProps,
  hasLink: boolean,
  messageType: string
) {
  const { images, files } = data.files;
  const hasImage = images && images.length > 0;
  const hasFile = files && files.length > 0;

  if (messageType === "hybrid") {
    // Handle hybrid message type and format it accordingly
    return `sent ${hasImage ? `${images.length} image${images.length > 1 ? "s" : ""}` : ""}${hasImage && hasFile ? " and " : ""}${hasFile ? `${files.length} file${files.length > 1 ? "s" : ""}` : ""}${(hasImage && hasLink) || (hasFile && hasLink) ? " and " : ""}${hasLink ? "a link" : ""}`;
  } else if (messageType === "image") {
    return `sent ${images.length} image${images.length > 1 ? "s" : ""}`;
  } else if (messageType === "file") {
    return `sent ${files.length} file${files.length > 1 ? "s" : ""}`;
  } else if (messageType === "link") {
    return `sent a link`;
  } else {
    return `sent a message`;
  }
}
