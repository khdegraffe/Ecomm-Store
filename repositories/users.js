const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async comparePassword(saved, supplied) {
    console.log("=== COMPARE PASSWORD DEBUG ===");
    console.log("Saved password:", saved);
    console.log("Supplied password:", supplied);

    if (!saved || !saved.includes(".")) {
      console.log("ERROR: Saved password doesn't contain salt separator");
      throw new Error("Invalid password format");
    }

    const [hashed, salt] = saved.split(".");
    console.log("Extracted hash:", hashed);
    console.log("Extracted salt:", salt);

    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
    return hashed === hashedSuppliedBuf.toString("hex");
  }

  async create(attributes) {
    attributes.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attributes.password, salt, 64);

    const records = await this.getAll();
    const record = {
      ...attributes,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }
}

module.exports = new UsersRepository("users.json");
