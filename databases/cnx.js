const mysql = require('mysql2/promise');

// Configuration de la base de données
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Remplacez par votre mot de passe MySQL
    database: 'sofiane',        // Remplacez par le nom de votre base de données
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;
