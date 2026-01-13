import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

export default async function seedDemoUsers() {
  const demoUsers = [
    {
      name: "Demo Student",
      email: "student@test.com",
      passwordPlain: "123456",
      role: "student",
      status: "ACTIVE",
    },
    {
      name: "samiul;",
      email: "samiul18@gmail.com",
      passwordPlain: "1234567#",
      role: "admin",
      status: "ACTIVE",
    },
  ];

  const demoAvatar =
    "https://api.dicebear.com/7.x/initials/svg?seed=Demo&backgroundColor=1f2937&textColor=ffffff";

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });

    if (!exists) {
      const hashed = await bcrypt.hash(u.passwordPlain, 10);

      await User.create({
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
        status: u.status,
        photoURL: demoAvatar, // ✅ string
        phone: "018338984848",
      });

      console.log(`✅ Seeded: ${u.email} (${u.role})`);
    } else {
      console.log(`ℹ️ Already exists: ${u.email}`);
    }
  }
}
