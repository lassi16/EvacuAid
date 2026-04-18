const mysql = require('mysql2/promise');
require('dotenv').config();

console.log("Connecting using:", process.env.DATABASE_URL);

async function run() {
    try {
        const pool = mysql.createPool(process.env.DATABASE_URL);
        const connection = await pool.getConnection();
        console.log("Connected natively via mysql2 successfully!");
        connection.release();
        process.exit(0);
    } catch (e) {
        console.error("Failed!", e);
        process.exit(1);
    }
}
run();
