const express = require('express');
const router = express.Router();
const rapportController = require('../controllers/rapport.controller');
const { IsAuthenticated, IsAuthenticatedAdmin } = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rapport:
 *       type: object
 *       required: [ppn_id, employe_id, prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max, district]
 *       properties:
 *         id_rapport:
 *           type: integer
 *           description: Unique identifier for the report
 *           example: 1
 *         ppn_id:
 *           type: integer
 *           description: ID of the PPN
 *           example: 1
 *         employe_id:
 *           type: integer
 *           description: ID of the employee who created the report
 *           example: 1
 *         prix_unitaire_min:
 *           type: string
 *           description: Minimum unit price in Ariary
 *           example: "2000.00"
 *         prix_unitaire_max:
 *           type: string
 *           description: Maximum unit price in Ariary
 *           example: "2500.00"
 *         prix_gros_min:
 *           type: string
 *           description: Minimum wholesale price in Ariary
 *           example: "1800.00"
 *         prix_gros_max:
 *           type: string
 *           description: Maximum wholesale price in Ariary
 *           example: "2200.00"
 *         district:
 *           type: string
 *           description: District where the report was made
 *           example: "Ambatondrazaka"
 *         observation:
 *           type: string
 *           description: Optional observation (max 500 characters)
 *           example: "Prix stable ce mois."
 *           nullable: true
 *         date:
 *           type: string
 *           format: date-time
 *           description: Report date
 *           example: "2025-05-01T10:00:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2025-05-01T10:00:00Z"
 *         ppn:
 *           type: object
 *           properties:
 *             id_ppn:
 *               type: integer
 *               example: 1
 *             nom_ppn:
 *               type: string
 *               example: "Riz"
 *             unite_prix:
 *               type: string
 *               example: "2000"
 *             unite_mesure:
 *               type: string
 *               example: "KG"
 *             description:
 *               type: string
 *               example: "Riz blanc local"
 *             employe_id:
 *               type: integer
 *               example: 1
 *           nullable: true
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
 *           example: "Rapport non trouvé."
 *     Message:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Rapport supprimé avec succès."
 */

/**
 * @swagger
 * /api/rapports:
 *   get:
 *     summary: List all reports (admin only)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rapport'
 *       403:
 *         description: Forbidden (admin only)
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
router.get('/rapports', IsAuthenticated, rapportController.getAllRapports);

/**
 * @swagger
 * /api/rapports/my:
 *   get:
 *     summary: List my reports
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rapport'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/rapports/my', IsAuthenticated, rapportController.getMyRapports);

/**
 * @swagger
 * /api/employes/rapports:
 *   get:
 *     summary: List all users with their reports and PPN details
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with reports and PPNs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_employe:
 *                     type: integer
 *                   cin:
 *                     type: string
 *                   nom:
 *                     type: string
 *                   email:
 *                     type: string
 *                   region:
 *                     type: string
 *                   fonction:
 *                     type: string
 *                   rapports:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Rapport'
 *       403:
 *         description: Forbidden
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

router.get('/employes/rapports', IsAuthenticatedAdmin, rapportController.getUsersWithRapports);

/**
 * @swagger
 * /api/rapports/{id_rapport}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rapport
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the report
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rapport'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Report not found
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
router.get('/rapports/:id_rapport', IsAuthenticated, rapportController.getOneRapport);

/**
 * @swagger
 * /api/rapports/search/{query}:
 *   get:
 *     summary: Search reports by PPN name, PPN description, observation, or district
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term for PPN name, PPN description, observation, or district
 *     responses:
 *       200:
 *         description: List of matching reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rapport'
 *       400:
 *         description: Invalid query
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
router.get('/rapports/search/:query', IsAuthenticated, rapportController.searchRapports);

/**
 * @swagger
 * /api/rapports:
 *   post:
 *     summary: Create a new report
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ppn_id, prix_unitaire_min, prix_unitaire_max, prix_gros_min, prix_gros_max, district]
 *             properties:
 *               ppn_id:
 *                 type: integer
 *                 example: 1
 *               prix_unitaire_min:
 *                 type: number
 *                 example: 2000
 *               prix_unitaire_max:
 *                 type: number
 *                 example: 2500
 *               prix_gros_min:
 *                 type: number
 *                 example: 1800
 *               prix_gros_max:
 *                 type: number
 *                 example: 2200
 *               district:
 *                 type: string
 *                 example: "Ambatondrazaka"
 *               observation:
 *                 type: string
 *                 example: "Prix stable ce mois."
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-01T10:00:00Z"
 *     responses:
 *       201:
 *         description: Report created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rapport'
 *       400:
 *         description: Invalid input
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rapports', IsAuthenticated, rapportController.addRapport);

/**
 * @swagger
 * /api/rapports/{id_rapport}:
 *   put:
 *     summary: Update a report (creator only)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rapport
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the report
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ppn_id:
 *                 type: integer
 *                 example: 1
 *               prix_unitaire_min:
 *                 type: number
 *                 example: 2000
 *               prix_unitaire_max:
 *                 type: number
 *                 example: 2500
 *               prix_gros_min:
 *                 type: number
 *                 example: 1800
 *               prix_gros_max:
 *                 type: number
 *                 example: 2200
 *               district:
 *                 type: string
 *                 example: "Ambatondrazaka"
 *               observation:
 *                 type: string
 *                 example: "Prix stable ce mois."
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-05-01T10:00:00Z"
 *     responses:
 *       200:
 *         description: Report updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rapport'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (not creator)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Report or PPN not found
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
router.put('/rapports/:id_rapport', IsAuthenticated, rapportController.updateRapport);

/**
 * @swagger
 * /api/rapports/{id_rapport}:
 *   delete:
 *     summary: Delete a report (creator only)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rapport
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the report
 *     responses:
 *       200:
 *         description: Report deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       403:
 *         description: Forbidden (not creator)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Report not found
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
router.delete('/rapports/:id_rapport', IsAuthenticated, rapportController.deleteRapport);

/**
 * @swagger
 * /api/rapports/dashboard/full:
 *   get:
 *     summary: Get admin dashboard statistics with optional filters
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering reports (YYYY-MM-DD)
 *         example: "2025-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering reports (YYYY-MM-DD)
 *         example: "2025-12-31"
 *       - in: query
 *         name: ppn_id
 *         schema:
 *           type: integer
 *         description: Filter by specific product (PPN ID)
 *         example: 1
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district (partial match)
 *         example: "Ambatondrazaka"
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_rapports:
 *                   type: integer
 *                   example: 100
 *                 avg_prix_unitaire:
 *                   type: string
 *                   example: "2250.00"
 *                 avg_prix_gros:
 *                   type: string
 *                   example: "2000.00"
 *                 max_prix_unitaire:
 *                   type: string
 *                   example: "3000.00"
 *                 min_prix_unitaire:
 *                   type: string
 *                   example: "1500.00"
 *                 max_prix_gros:
 *                   type: string
 *                   example: "2500.00"
 *                 min_prix_gros:
 *                   type: string
 *                   example: "1200.00"
 *                 by_month:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-05"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       max_prix_unitaire:
 *                         type: string
 *                         example: "3000.00"
 *                       min_prix_unitaire:
 *                         type: string
 *                         example: "1500.00"
 *                       count:
 *                         type: integer
 *                         example: 10
 *                 by_year:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: string
 *                         example: "2025"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       count:
 *                         type: integer
 *                         example: 50
 *                 by_ppn:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nom_ppn:
 *                         type: string
 *                         example: "Riz"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       max_prix_unitaire:
 *                         type: string
 *                         example: "3000.00"
 *                       min_prix_unitaire:
 *                         type: string
 *                         example: "1500.00"
 *                       max_prix_gros:
 *                         type: string
 *                         example: "2500.00"
 *                       min_prix_gros:
 *                         type: string
 *                         example: "1200.00"
 *                       count:
 *                         type: integer
 *                         example: 20
 *                       change_frequency:
 *                         type: integer
 *                         example: 5
 *                       price_evolution:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: string
 *                               example: "2025-05-01"
 *                             avg_prix_unitaire:
 *                               type: string
 *                               example: "2250.00"
 *                             avg_prix_gros:
 *                               type: string
 *                               example: "2000.0006"
 *                 by_employe:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nom:
 *                         type: string
 *                         example: "Rakoto"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       count:
 *                         type: integer
 *                         example: 15
 *                 by_district:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       district:
 *                         type: string
 *                         example: "Ambatondrazaka"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       max_prix_unitaire:
 *                         type: string
 *                         example: "3000.00"
 *                       min_prix_unitaire:
 *                         type: string
 *                         example: "1500.00"
 *                       count:
 *                         type: integer
 *                         example: 12
 *                 by_region:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       region:
 *                         type: string
 *                         example: "ANALAMANGA"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *                       max_prix_unitaire:
 *                         type: string
 *                         example: "3000.00"
 *                       min_prix_unitaire:
 *                         type: string
 *                         example: "1500.00"
 *                       count:
 *                         type: integer
 *                         example: 30
 *                 inflation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-05"
 *                       inflation_rate:
 *                         type: string
 *                         example: "2.50"
 *                 ipc:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-05"
 *                       ipc:
 *                         type: string
 *                         example: "102.50"
 *                 most_expensive_month:
 *                   type: string
 *                   example: "2025-05"
 *                 price_evolution:
 *                   Jon: true
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-05"
 *                       avg_prix_unitaire:
 *                         type: string
 *                         example: "2250.00"
 *                       avg_prix_gros:
 *                         type: string
 *                         example: "2000.00"
 *       400:
 *         description: Invalid query parameters (e.g., invalid dates)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (admin only)
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
router.get('/rapports/dashboard/full', IsAuthenticatedAdmin, rapportController.getStats);

/**
 * @swagger
 * /api/rapports/dashboard/:
 *   get:
 *     summary: Dashboard modérateur (PPN, rapports, régions, derniers rapports)
 *     tags: [Rapports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard modérateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 region:
 *                   type: string
 *                   example: ANALAMANGA
 *                 stats:
 *                   type: object
 *                   properties:
 *                     produitsPpn:
 *                       type: integer
 *                       example: 5
 *                     rapportsThisMonth:
 *                       type: integer
 *                       example: 0
 *                     totalRapports:
 *                       type: integer
 *                       example: 8
 *                     nombreRegions:
 *                       type: integer
 *                       example: 22
 *                 ppns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_ppn:
 *                         type: integer
 *                         example: 1
 *                       nom_ppn:
 *                         type: string
 *                         example: Riz local
 *                       description:
 *                         type: string
 *                         example: Riz blanc local
 *                       unite_mesure_unitaire:
 *                         type: string
 *                         example: KG
 *                         nullable: true
 *                       unite_mesure_gros:
 *                         type: string
 *                         example: SAC
 *                         nullable: true
 *                       observation:
 *                         type: string
 *                         example: Produit saisonnier
 *                         nullable: true
 *                       employe_id:
 *                         type: integer
 *                         example: 1
 *                 latestRapports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rapport'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (modérateur seulement)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profil modérateur introuvable
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
router.get(
  '/dashboard',
  IsAuthenticated,
  rapportController.getDashboard
);


module.exports = router;