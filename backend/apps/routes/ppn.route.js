const express = require('express');
const router = express.Router();
const ppnController = require('../controllers/ppn.controller');
const { IsAuthenticated, IsAuthenticatedAdmin } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ppn:
 *       type: object
 *       required: [description, employe_id]
 *       properties:
 *         id_ppn:
 *           type: integer
 *           description: Unique identifier for the PPN
 *           example: 1
 *         unite_mesure_unitaire:
 *           type: string
 *           description: Unit of measure for retail (e.g., KG, GRAMME)
 *           example: "KG"
 *           nullable: true
 *         unite_mesure_gros:
 *           type: string
 *           description: Unit of measure for wholesale (e.g., SAC, LITRE)
 *           example: "SAC"
 *           nullable: true
 *         observation:
 *           type: string
 *           description: Additional notes about the PPN
 *           example: "Produit saisonnier"
 *           nullable: true
 *         description:
 *           type: string
 *           description: Description of the PPN (max 200 characters)
 *           example: "Riz blanc local"
 *         nom_ppn:
 *           type: string
 *           description: Nom de PPN (max 200 characters)
 *           example: "Riz blanc local"
 *         employe_id:
 *           type: integer
 *           description: ID of the employee managing the PPN
 *           example: 1
 *         employe:
 *           type: object
 *           properties:
 *             id_employe:
 *               type: integer
 *               example: 1
 *             cin:
 *               type: string
 *               example: "123456789012"
 *             nom:
 *               type: string
 *               example: "Rakoto"
 *             email:
 *               type: string
 *               example: "rakoto@example.com"
 *             region:
 *               type: string
 *               example: "Analamanga"
 *             fonction:
 *               type: string
 *               example: "MODERATEUR"
 *           nullable: true
 *     Error:
 *       type: object
 *       properties:
 *         erreur:
 *           type: string
 *           description: Error message
 *           example: "PPN non trouvé."
 *     Message:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "PPN supprimé avec succès."
 */

/**
 * @swagger
 * /api/ppns:
 *   post:
 *     summary: Create a new PPN
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom_ppn]
 *             properties:
 *               unite_mesure_unitaire:
 *                 type: string
 *                 example: "KG"
 *               unite_mesure_gros:
 *                 type: string
 *                 example: "SAC"
 *               observation:
 *                 type: string
 *                 example: "Produit saisonnier"
 *               description:
 *                 type: string
 *                 example: "Riz blanc local"
 *               nom_ppn:
 *                 type: string
 *                 example: "Riz blanc"
 *     responses:
 *       201:
 *         description: PPN created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Bad request (missing or invalid fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/ppns', IsAuthenticated, ppnController.addPpn);

/**
 * @swagger
 * /api/ppns:
 *   get:
 *     summary: Get all PPNs
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of PPNs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Error retrieving PPNs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ppns', IsAuthenticated, ppnController.getAllPpn);

/**
 * @swagger
 * /api/ppns/search/{query}:
 *   get:
 *     summary: Search PPNs by unit, observation, or description, or nom_ppn
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term for unit, observation, or description , or nom_ppn
 *     responses:
 *       200:
 *         description: List of matching PPNs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Error retrieving PPNs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ppns/search/:query', IsAuthenticated, ppnController.getAllPpn);

/**
 * @swagger
 * /api/ppns/search/:
 *   get:
 *     summary: Get all PPNs (fallback for empty search)
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all PPNs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Error retrieving PPNs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ppns/search/', IsAuthenticated, ppnController.getAllPpn);

/**
 * @swagger
 * /api/ppns/{id_ppn}:
 *   get:
 *     summary: Get a PPN by ID
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_ppn
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the PPN
 *     responses:
 *       200:
 *         description: PPN details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: PPN not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ppns/:id_ppn', IsAuthenticated, ppnController.getOnePpn);

/**
 * @swagger
 * /api/ppns/{id_ppn}:
 *   put:
 *     summary: Update a PPN by ID
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_ppn
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the PPN
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unite_mesure_unitaire:
 *                 type: string
 *                 example: "KG"
 *               unite_mesure_gros:
 *                 type: string
 *                 example: "SAC"
 *               observation:
 *                 type: string
 *                 example: "Produit saisonnier"
 *               nom_ppn:
 *                 type: string
 *                 example: "Riz"
 *               description:
 *                 type: string
 *                 example: "Riz blanc local"
 *               employe_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: PPN updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ppn'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: PPN or Employe not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/ppns/:id_ppn', IsAuthenticatedAdmin, ppnController.updatePpn);

/**
 * @swagger
 * /api/ppns/{id_ppn}:
 *   delete:
 *     summary: Delete a PPN by ID
 *     tags: [Ppns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_ppn
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the PPN
 *     responses:
 *       200:
 *         description: PPN deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: PPN not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/ppns/:id_ppn', IsAuthenticatedAdmin, ppnController.deletePpn);

module.exports = router;