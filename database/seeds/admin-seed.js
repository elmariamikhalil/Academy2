const bcrypt = require("bcryptjs");
const db = require("../../server/models");

const createAdminUser = async () => {
  try {
    const existingAdmin = await db.users.findOne({
      where: { username: "admin" },
    });

    if (!existingAdmin) {
      await db.users.create({
        username: "admin",
        email: "admin@marabes.academy",
        password: bcrypt.hashSync("admin123", 8),
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = {
  createAdminUser,
};
