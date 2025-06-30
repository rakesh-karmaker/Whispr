const bcrypt = require("bcrypt");
const generateId = require("./generateId");

export default async function generateSessionId(): Promise<string> {
  const id = generateId();
  const salt = await bcrypt.genSalt(10); // generate salt of length 10
  const hash = await bcrypt.hash(id, salt);
  return hash;
}
