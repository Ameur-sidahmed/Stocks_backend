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

// Lire toutes les catégories
app.get('/CategorieAll', (req, res) => {
    const query = 'SELECT id, nom, created_at, updated_at FROM categories';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucune catégorie trouvée' });
        }

        const categories = results.map(cat => ({
            id: cat.id,
            nom: cat.nom,
            date: cat.created_at
        }));

        res.status(200).json({
            data: categories,
            message: 'success'
        });
    });
});

// Ajouter une catégorie
app.post('/CategorieSave', (req, res) => {
    const { nom } = req.body;

    if (!nom) {
        return res.status(400).json({ message: 'Le nom est requis' });
    }

    const query = 'INSERT INTO categories (nom, created_at) VALUES (?, NOW())';
    db.query(query, [nom], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        res.status(201).json({
            data: { id: results.insertId, nom },
            message: 'Catégorie créée avec succès'
        });
    });
});


// Mettre à jour une catégorie
app.put('/CategorieEdit/:id', (req, res) => {
    const { nom } = req.body;

    if (!nom) {
        return res.status(400).json({ message: 'Le nom est requis' });
    }

    const query = 'UPDATE categories SET nom = ?, updated_at = NOW() WHERE id = ?';
    db.query(query, [nom, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        res.status(200).json({
            data: { id: req.params.id, nom },
            message: 'Catégorie mise à jour avec succès'
        });
    });
});

// Supprimer une catégorie
app.delete('/CategorieDelete/:id', (req, res) => {
    const query = 'DELETE FROM categories WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        res.status(200).json({ message: 'Catégorie supprimée avec succès' });
    });
});



// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
