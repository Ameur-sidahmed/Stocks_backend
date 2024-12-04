const express = require('express');
const app = express();
const port = 3000;
const db = require('./databases/cnx.js')
const cors = require('cors'); // Importer le middleware CORS
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        process.exit(1); // Arrêter le serveur si la base de données est inaccessible
    }
    console.log('Connecté à la base de données MySQL!');
});

app.get('api/SaveCategorie', (req, res) => {
    res.send('Bienvenue sur le serveur Node.js connecté à MySQL!');
});

app.get('/stocks', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de la récupération des données.');
        }
        res.json(results); // Retourner les résultats sous forme de JSON
    });
});



// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
