// app.js

// Importer les dépendances
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer'); // Importer multer
const path = require('path');

// Créer l'application Express
const app = express();
const port = 3000;

// Utiliser le middleware CORS pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Configurer le stockage des fichiers avec multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les fichiers seront enregistrés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Initialiser multer avec la configuration de stockage
const upload = multer({ storage });

// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importer la configuration de la base de données
const db = require('./databases/cnx');

// Vérifier la connexion à la base de données
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connecté à la base de données MySQL!');
    connection.release();
  } catch (err) {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1); // Arrêter le serveur si la base de données est inaccessible
  }
})();

// Lire toutes les catégories
app.get('/CategorieAll', async (req, res) => {
  const query = 'SELECT id, nom, created_at, updated_at FROM categories';
  try {
    const [results] = await db.query(query);

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
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Ajouter une catégorie
app.post('/CategorieSave', async (req, res) => {
  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ message: 'Le nom est requis' });
  }

  const query = 'INSERT INTO categories (nom, created_at) VALUES (?, NOW())';
  try {
    const [results] = await db.query(query, [nom]);
    res.status(201).json({
      data: { id: results.insertId, nom },
      message: 'Catégorie créée avec succès'
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Mettre à jour une catégorie
app.put('/CategorieEdit/:id', async (req, res) => {
  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ message: 'Le nom est requis' });
  }

  const query = 'UPDATE categories SET nom = ?, updated_at = NOW() WHERE id = ?';
  try {
    const [results] = await db.query(query, [nom, req.params.id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.status(200).json({
      data: { id: req.params.id, nom },
      message: 'Catégorie mise à jour avec succès'
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Supprimer une catégorie
app.delete('/CategorieDelete/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10); // Parse l'id pour s'assurer qu'il est valide
  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  const query = 'DELETE FROM categories WHERE id = ?';
  try {
    const [results] = await db.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.status(200).json({ message: 'Catégorie supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Lire tous les produits
app.get('/ProduitAll', async (req, res) => {
  const query = 'SELECT id, categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image FROM produits';
  try {
    const [results] = await db.query(query);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun produit trouvé' });
    }

    const produits = results.map(produit => ({
      id: produit.id,
      categorie_id: produit.categorie_id,
      nom: produit.nom,
      description: produit.description,
      prix_vente: produit.prix_vente,
      prix_achat: produit.prix_achat,
      quantite: produit.quantite,
      reference: produit.reference,
      image: produit.image
    }));

    res.status(200).json({
      data: produits,
      message: 'success'
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
});

// Ajouter un produit avec gestion des images
// Ajouter un produit avec gestion des images
// Ajouter un produit avec gestion des images
app.post('/ProduitSave', upload.single('image'), async (req, res) => {

    const { categorie_id, nom, description, prix_vente, prix_achat, quantite, reference } = req.body;
    console.log('Requête reçue pour /ProduitSave');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    // Vérifier que tous les champs requis sont fournis
    if (!categorie_id || !nom || !description || !prix_vente || !prix_achat || !quantite || !reference) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
    }
  
    // Récupérer le chemin de l'image uploadée ou utiliser l'image par défaut
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png';
  
    const query = `
      INSERT INTO produits 
      (categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    try {
      const [results] = await db.query(query, [
        categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, imagePath
      ]);
      res.status(201).json({
        data: { 
          id: results.insertId, 
          categorie_id, 
          nom, 
          description, 
          prix_vente, 
          prix_achat, 
          quantite, 
          reference, 
          image: imagePath 
        },
        message: 'Produit créé avec succès'
      });
    } catch (err) {
      console.error('Erreur lors de l\'insertion du produit :', err);
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  });
  
  
// Mettre à jour un produitapp.put('/ProduitEdit/:id', async (req, res) => {
    app.put('/ProduitEdit/:id', async (req, res) => {
        const { categorie_id, nom, description, prix_vente, prix_achat, quantite, reference } = req.body;
      
        // Vérification des champs requis
        if (!categorie_id || !nom || !prix_vente || !prix_achat || !quantite || !reference) {
          return res.status(400).json({ message: 'Tous les champs requis doivent être fournis' });
        }
      
        // Requête SQL
        const query = `
          UPDATE produits 
          SET 
            categorie_id = ?, 
            nom = ?, 
            description = ?, 
            prix_vente = ?, 
            prix_achat = ?, 
            quantite = ?, 
            reference = ? 
          WHERE id = ?`;
      
        try {
          // Exécution de la requête SQL
          const [results] = await db.query(query, [categorie_id, nom, description, prix_vente, prix_achat, quantite, reference, req.params.id]);
      
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
          }
      
          res.status(200).json({
            data: { id: req.params.id, categorie_id, nom, description, prix_vente, prix_achat, quantite, reference },
            message: 'Produit mis à jour avec succès'
          });
        } catch (err) {
          console.error("Erreur lors de l'exécution de la requête :", err);  // Logs pour plus de détails
          res.status(500).json({ message: 'Erreur serveur', error: err });
        }
      });
      

// Supprimer un produit
app.delete('/ProduitDelete/:id', async (req, res) => {
  const produitId = req.params.id;

  // Vérification si l'ID est valide
  if (!produitId) {
    return res.status(400).json({ message: "ID du produit manquant" });
  }

  // Requête SQL pour supprimer le produit
  const query = 'DELETE FROM produits WHERE id = ?';
  
  try {
    const [results] = await db.query(query, [produitId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.status(200).json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression', error: err });
  }
});


// Lire toutes les factures
app.get('/FacturesAll', async (req, res) => {
  try {
    // Requête SQL pour récupérer les factures avec les produits et leur prix de vente
    const [factures] = await db.query(`
      SELECT 
        f.id AS facture_id,
        f.nom_client,
        f.prix_total,
        f.date_creation,
        p.id AS produit_id,
        p.nom AS produit_nom,
        p.prix_vente AS produit_prix_vente,
        af.quantite AS produit_quantite
      FROM 
        factures f
      LEFT JOIN 
        articles_facture af ON f.id = af.facture_id
      LEFT JOIN 
        produits p ON af.produit_id = p.id
    `);

    console.log(factures);

    // Organiser les données en un format de facture
    const facturesMap = {};
    factures.forEach((row) => {
      const factureId = row.facture_id;

      // Si la facture n'existe pas encore, l'ajouter à facturesMap
      if (!facturesMap[factureId]) {
        facturesMap[factureId] = {
          id: factureId,
          nom_client: row.nom_client,
          prix_total: row.prix_total, // Gardez le prix total de la facture
          date_creation: row.date_creation,
          produits: []
        };
      }

      // Si un produit existe dans la facture, l'ajouter avec ses informations
      if (row.produit_id) {
        facturesMap[factureId].produits.push({
          id: row.produit_id,
          nom: row.produit_nom,
          quantite: row.produit_quantite,
          prix_vente: row.produit_prix_vente, // Ajout du prix de vente
          prix_total: (row.produit_prix_vente * row.produit_quantite).toFixed(2) // Calcul du prix total du produit
        });
      }
    });

    // Convertir facturesMap en tableau pour l'envoyer au client
    const result = Object.values(facturesMap);

    res.status(200).json(result);
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
app.put('/FacturesUpdate/:id', async (req, res) => {
  const { produits, id } = req.body; // L'ID de la facture est dans le body aussi
  console.log(req.body);

  console.log("Produits reçus dans le backend :", produits);

  try {
    for (const produit of produits) {
      console.log(`Produit ID : ${produit.produit_id}, Quantité : ${produit.quantite}`);

      // Vérifier si le produit existe dans la table `produits`
      const [rows] = await db.query('SELECT id FROM produits WHERE id = ?', [produit.produit_id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: `Produit avec ID ${produit.produit_id} non trouvé.` });
      }

      // Vérifier si l'entrée existe déjà dans la table `article_facture`
      const [existingArticle] = await db.query(
        'SELECT * FROM articles_facture WHERE facture_id = ? AND produit_id = ?',
        [id, produit.produit_id]
      );

      if (existingArticle.length > 0) {
        // Si l'entrée existe déjà, mettre à jour la quantité
        await db.query(
          'UPDATE articles_facture SET quantite = ? WHERE facture_id = ? AND produit_id = ?',
          [produit.quantite, id, produit.produit_id]
        );
        console.log(`Quantité du produit ID ${produit.produit_id} mise à jour à ${produit.quantite}`);
      } else {
        // Sinon, insérer une nouvelle ligne dans la table `articles_facture`
        await db.query(
          'INSERT INTO articles_facture (facture_id, produit_id, quantite) VALUES (?, ?, ?)',
          [id, produit.produit_id, produit.quantite]
        );
        console.log(`Produit ID ${produit.produit_id} ajouté à la facture ${id}`);
      }
    }

    // Si tout est ok, envoyer une réponse de succès
    res.status(200).json({ message: "Facture mise à jour avec succès." });
  } catch (err) {
    console.error("Erreur backend :", err);
    res.status(500).json({ message: "Erreur serveur.", error: err.message });
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
