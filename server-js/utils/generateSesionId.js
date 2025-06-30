const bcrypt = require("bcrypt");
const generateId = require("./generateId");

exports.generateSessionId = async () => {
  const id = generateId();
  const salt = await bcrypt.genSalt(10); // generate salt of length 10
  const hash = await bcrypt.hash(id, salt);
  return hash;
};
