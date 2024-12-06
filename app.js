const express = require('express');
const cors = require('cors');
const db = require('./databases/cnx.js'); // Assurez-vous que cnx.js est correctement configuré

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Tester la connexion à la base de données
db.query('SELECT 1')
    .then(() => {
        console.log('Connecté à la base de données MySQL!');
    })
    .catch((err) => {
        console.error('Erreur de connexion à la base de données :', err);
        process.exit(1); // Arrêter le serveur si la connexion échoue
    });
//les Api Categories
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


// les Api Produits
// Lire tous les produits
app.get('/ProduitAll', (req, res) => {
    const query = 'SELECT id, categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image, created_at, updated_at FROM produits';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucun produit trouvé' });
        }

        const produits = results.map(prod => ({
            id: prod.id,
            categorie_id: prod.categorie_id,
            nom: prod.nom,
            description: prod.description,
            prix_vente: prod.prix_vente,
            prix_achat: prod.prix_achat,
            quantite: prod.quantite,
            reference: prod.reference,
            image: prod.image,
            date: prod.created_at
        }));

        res.status(200).json({
            data: produits,
            message: 'success'
        });
    });
});

// Ajouter un produit
app.post('/ProduitSave', (req, res) => {
    const { categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image } = req.body;

    if (!categorie_id || !nom || !prix_vente || !prix_achat || !quantite || !reference) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    const query = 'INSERT INTO produits (categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    db.query(query, [categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        res.status(201).json({
            data: { id: results.insertId, categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image },
            message: 'Produit créé avec succès'
        });
    });
});

// Mettre à jour un produit
app.put('/ProduitEdit/:id', (req, res) => {
    const { categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image } = req.body;

    if (!categorie_id || !nom || !prix_vente || !prix_achat || !quantite || !reference) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }

    const query = 'UPDATE produits SET categorie_id = ?, nom = ?, description = ?, prix_vente = ?, prix_achat = ?, quantite = ?, reference = ?, image = ?, updated_at = NOW() WHERE id = ?';
    db.query(query, [categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.status(200).json({
            data: { id: req.params.id, categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image },
            message: 'Produit mis à jour avec succès'
        });
    });
});

// Supprimer un produit
app.delete('/ProduitDelete/:id', (req, res) => {
    const query = 'DELETE FROM produits WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.status(200).json({ message: 'Produit supprimé avec succès' });
    });
});


// Les API Factures
// Lire toutes les factures
app.get('/FacturesAll', async (req, res) => {
    try {
        const [results] = await db.query('SELECT id, nom_client, prix_total, date_creation FROM factures');
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucune facture trouvée' });
        }

        const factures = results.map(fact => ({
            id: fact.id,
            nom_client: fact.nom_client,
            prix_total: fact.prix_total,
            date_creation: fact.date_creation,
        }));

        res.status(200).json({
            data: factures,
            message: 'success'
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// Ajouter une facture avec gestion des stocks
app.post('/FactureSave', async (req, res) => {
    const { nom_client, produits } = req.body;

    // Validation des champs requis
    if (!nom_client || !Array.isArray(produits) || produits.length === 0) {
        return res.status(400).json({ message: 'Le nom du client et les produits sont requis' });
    }

    let conn;

    try {
        // Acquérir une connexion du pool
        conn = await db.getConnection();
        await conn.beginTransaction();

        // Vérifier la disponibilité des produits et calculer le prix total
        let prix_total = 0;
        const produitsVerifies = [];

        for (let produit of produits) {
            const { produit_id, quantite } = produit;

            if (!produit_id || quantite <= 0) {
                await conn.rollback();
                return res.status(400).json({ message: 'Chaque produit doit avoir un ID et une quantité valide' });
            }

            // Vérifier la disponibilité du produit dans le stock
            const [stockResults] = await conn.query('SELECT nom, quantite, prix_vente FROM produits WHERE id = ?', [produit_id]);

            if (stockResults.length === 0) {
                await conn.rollback();
                return res.status(404).json({ message: `Le produit avec l'ID ${produit_id} n'existe pas.` });
            }

            const stock = stockResults[0];

            if (stock.quantite < quantite) {
                await conn.rollback();
                return res.status(400).json({ message: `Le produit ${stock.nom} n'a pas assez de stock.` });
            }

            // Ajouter le produit validé à la liste
            produitsVerifies.push({
                produit_id,
                quantite,
                prix_vente: stock.prix_vente,
                nom: stock.nom
            });

            prix_total += stock.prix_vente * quantite;
        }

        // Insérer la facture avec le prix total calculé
        const [factureResult] = await conn.query(
            'INSERT INTO factures (nom_client, prix_total, date_creation) VALUES (?, ?, NOW())',
            [nom_client, prix_total]
        );
        const factureId = factureResult.insertId;

        // Préparer les données pour insérer dans `articles_facture`
        const articlesData = produitsVerifies.map((p) => [factureId, p.produit_id, p.quantite]);

        // Insérer les articles de la facture
        await conn.query('INSERT INTO articles_facture (facture_id, produit_id, quantite) VALUES ?', [articlesData]);

        // Mettre à jour les stocks
        for (let produit of produitsVerifies) {
            await conn.query('UPDATE produits SET quantite = quantite - ? WHERE id = ?', [produit.quantite, produit.produit_id]);
        }

        // Valider la transaction
        await conn.commit();

        res.status(201).json({
            message: 'Facture créée avec succès',
            data: {
                factureId,
                nom_client,
                prix_total,
                produits: produitsVerifies
            }
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Erreur lors de l\'ajout de la facture :', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release(); // Libérer la connexion
    }
});

// Mettre à jour une facture
app.put('/FacturesEdit/:id', async (req, res) => {
    const { nom_client, prix_total } = req.body;

    if (!nom_client || !prix_total) {
        return res.status(400).json({ message: 'Le nom du client et le prix total sont requis' });
    }

    try {
        const [results] = await db.query(
            'UPDATE factures SET nom_client = ?, prix_total = ?, date_creation = NOW() WHERE id = ?',
            [nom_client, prix_total, req.params.id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        res.status(200).json({
            data: { id: req.params.id, nom_client, prix_total },
            message: 'Facture mise à jour avec succès'
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});

// Supprimer une facture
app.delete('/FacturesDelete/:id', async (req, res) => {
    try {
        const [results] = await db.query('DELETE FROM factures WHERE id = ?', [req.params.id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }
        res.status(200).json({ message: 'Facture supprimée avec succès' });
         } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err });
    }
});


// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
