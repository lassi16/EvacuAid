const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: '34.61.83.89',
    user: 'deadlock',
    password: ')#qN<9O#Z*Pjh8g<',
    database: 'evacuaid',
    port: 3306
});
pool.getConnection()
    .then(conn => {
        console.log("Connected to native mariadb successfully!");
        conn.release();
        process.exit(0);
    })
    .catch(err => {
        console.error("Failed to connect", err);
        process.exit(1);
    });
