const bcrypt = require("bcrypt");

module.exports = {
  up: async (connection) => {
    try {
      console.log("Starting user seeding...");
      
      const users = [
        { nama: "Ahmad Fauzi", email: "ahmad@example.com" },
        { nama: "Siti Rahma", email: "siti@example.com" },
        { nama: "Budi Santoso", email: "budi@example.com" },
        { nama: "Dewi Lestari", email: "dewi@example.com" },
        { nama: "Hendra Prasetyo", email: "hendra@example.com" },
        { nama: "Indah Permata", email: "indah@example.com" },
        { nama: "Joko Widodo", email: "joko@example.com" },
        { nama: "Kartini Ayu", email: "kartini@example.com" },
        { nama: "Lukman Hakim", email: "lukman@example.com" },
        { nama: "Mega Wati", email: "mega@example.com" },
      ];
      
      const plainPassword = "password123";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      for (const user of users) {
        await connection.query(
          `INSERT INTO pengguna (nama, email, password, peran, status) VALUES (?, ?, ?, 'Editor', 'Approved')`,
          [user.nama, user.email, hashedPassword]
        );
        console.log(`User ${user.nama} inserted.`);
      }
      
      console.log("User seeding completed successfully.");
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  },

  down: async (connection) => {
    try {
      console.log("Reverting user seeding...");
      await connection.query("DELETE FROM pengguna WHERE peran = 'Editor' AND status = 'Approved'");
      console.log("User seeding reverted successfully.");
    } catch (error) {
      console.error("Error reverting users:", error);
    }
  },
};