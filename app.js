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
app.get('/FacturesAll', (req, res) => {
    const query = 'SELECT id, nom_client, prix_total, date_creation FROM factures';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

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
    });
});

// Ajouter une facture
app.post('/FactureSave', async (req, res) => {
    const { nom_client, produits } = req.body;

    // Validation des champs requis
    if (!nom_client || !Array.isArray(produits) || produits.length === 0) {
        return res.status(400).json({ message: 'Le nom du client et les produits sont requis' });
    }

    try {
        // Démarrer une transaction
        await db.beginTransaction();

        // Vérifier la disponibilité des produits et calculer le prix total
        let prix_total = 0;
        const produitsVerifies = [];

        for (let produit of produits) {
            const { produit_id, quantite } = produit;

            if (!produit_id || quantite <= 0) {
                return res.status(400).json({ message: 'Chaque produit doit avoir un ID et une quantité valide' });
            }

            // Vérifier la disponibilité du produit dans le stock
            const queryStock = 'SELECT nom, quantite, prix_vente FROM produits WHERE id = ?';
            const [stockResult] = await db.query(queryStock, [produit_id]);

            if (!stockResult || stockResult.quantite < quantite) {
                throw new Error(`Le produit ${stockResult ? stockResult.nom : 'inconnu'} n'a pas assez de stock.`);
            }

            // Ajouter le produit validé à la liste
            produitsVerifies.push({
                produit_id,
                quantite,
                prix_vente: stockResult.prix_vente,
                nom: stockResult.nom
            });

            prix_total += stockResult.prix_vente * quantite;
        }

        // Insérer la facture
        const queryFacture = 'INSERT INTO factures (nom_client, prix_total, date_creation) VALUES (?, ?, NOW())';
        const [factureResult] = await db.query(queryFacture, [nom_client, prix_total]);
        const factureId = factureResult.insertId;

        // Insérer les produits de la facture
        const queryArticles = 'INSERT INTO articles_facture (facture_id, produit_id, quantite) VALUES ?';
        const articlesData = produitsVerifies.map((p) => [factureId, p.produit_id, p.quantite]);
        await db.query(queryArticles, [articlesData]);

        // Mettre à jour les stocks
        for (let produit of produitsVerifies) {
            const queryUpdateStock = 'UPDATE produits SET quantite = quantite - ? WHERE id = ?';
            await db.query(queryUpdateStock, [produit.quantite, produit.produit_id]);
        }

        // Valider la transaction
        await db.commit();

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
        // Annuler la transaction en cas d'erreur
        await db.rollback();
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});


// Mettre à jour une facture
app.put('/FacturesEdit/:id', (req, res) => {
    const { nom_client, prix_total } = req.body;

    if (!nom_client || !prix_total) {
        return res.status(400).json({ message: 'Le nom du client et le prix total sont requis' });
    }

    const query = 'UPDATE factures SET nom_client = ?, prix_total = ?, date_creation = NOW() WHERE id = ?';
    db.query(query, [nom_client, prix_total, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        res.status(200).json({
            data: { id: req.params.id, nom_client, prix_total },
            message: 'Facture mise à jour avec succès'
        });
    });
});

// Supprimer une facture
app.delete('/FacturesDelete/:id', (req, res) => {
    const query = 'DELETE FROM factures WHERE id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Facture non trouvée' });
        }

        res.status(200).json({ message: 'Facture supprimée avec succès' });
    });
});



// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
