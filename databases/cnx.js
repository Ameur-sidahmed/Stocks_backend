const mysql = require('mysql2');

// Configuration de la connexion
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         
    password: '',        
    database: 'sofiane'
});
// 
module.exports = db;
