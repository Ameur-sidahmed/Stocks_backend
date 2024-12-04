const mysql = require('mysql2');

// Configuration de la connexion
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         
    password: '',        
    database: 'stocks'
});
// 
module.exports = db;
