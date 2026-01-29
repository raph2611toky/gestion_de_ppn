const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employe.controller');
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../../middlewares/auth.middleware");
const { uploadRegister, uploadPhoto } = require('../../middlewares/upload.middleware');

/**
 * @swagger
 * /api/register/:
 *   post:
 *     summary: S'inscrire pour un Administrateur
 *     tags: [Employes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cin, nom, email, password, region, fonction]
 *             properties:
 *               cin:
 *                 type: string
 *                 example: "123456789012"
 *               nom:
 *                 type: string
 *                 example: "Rakoto"
 *               email:
 *                 type: string
 *                 example: "rakoto@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               region:
 *                 type: string
 *                 enum: [DIANA, SAVA, ITASY, ANALAMANGA, VAKINANKARATRA, BONGOLAVA, SOFIA, BOENY, BETSIBOKA, MELAKY, ALAOTRA_MANGORO, ATSINANANA, ANALANJIROFO, AMORON_I_MANIA, HAUTE_MATSIATRA, VATOVAVY_FITOVINANY, ATSIMO_ATSINANANA, IHOROMBE, MENABE, ATSIMO_ANDREFANA, ANDROY, ANOSY]
 *                 example: "Analamanga"
 *               fonction:
 *                 type: string
 *                 enum: [MODERATEUR, ADMINISTRATEUR]
 *                 example: "MODERATEUR"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employe'
 *       400:
 *         description: Bad request (missing fields or invalid CIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: CIN already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/register', uploadRegister, employeController.addEmploye);

/**
 * @swagger
 * /api/employes:
 *   get:
 *     summary: Liste des employés (avec filtre optionnel par nom)
 *     description: |
 *       Retourne tous les employés ou ceux correspondant au filtre `nom`.
 *       Paramètre optionnel `withModerateur=true` pour inclure les informations des modérateurs.
 *       Les URLs des photos et pièces d'identité sont retournées en absolu.
 *     tags: [Employes]
 *     parameters:
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *         required: false
 *         description: Filtre par nom (recherche partielle)
 *       - in: query
 *         name: withModerateur
 *         schema:
 *           type: boolean
 *           default: false
 *         required: false
 *         description: Inclure les détails modérateur (region, vérification, etc.)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des employés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_employe:
 *                         type: integer
 *                       cin:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       email:
 *                         type: string
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                       fonction:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       moderateurDetails:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           region:
 *                             type: string
 *                           is_verified:
 *                             type: boolean
 *                           is_validated:
 *                             type: boolean
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/employes', IsAuthenticated, employeController.getAllEmploye);

/**
 * @swagger
 * /api/employes/profile/{employe_id}:
 *   get:
 *     summary: Get an employee by id
 *     tags: [Employes]
 *     parameters:
 *       - in: path
 *         name: employe_id
 *         schema:
 *           type: string
 *         required: true
 *         description: CIN of the employee
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employe'
 *       400:
 *         description: Invalid CIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
router.get('/employes/profile/:employe_id', IsAuthenticatedAdmin, employeController.getOneEmploye);

/**
 * @swagger
 * /api/employes/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     description: Retourne les informations de l'employé authentifié. Si l'utilisateur est un modérateur, inclut également les informations du modèle Moderateur (région, statut vérification/validation, URLs des pièces d'identité).
 *     tags: [Employes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'employé (avec détails modérateur si applicable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_employe:
 *                   type: integer
 *                 cin:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 email:
 *                   type: string
 *                 photo:
 *                   type: string
 *                   nullable: true
 *                   description: URL complète de la photo
 *                 fonction:
 *                   type: string
 *                   enum: [MODERATEUR, ADMINISTRATEUR]
 *                 is_active:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 moderateurDetails:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     region:
 *                       type: string
 *                     is_verified:
 *                       type: boolean
 *                     is_validated:
 *                       type: boolean
 *                     piece_identite_face:
 *                       type: string
 *                       nullable: true
 *                       description: URL complète
 *                     piece_identite_recto:
 *                       type: string
 *                       nullable: true
 *                       description: URL complète
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Profil non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/employes/profile', IsAuthenticated, employeController.getProfileEmploye);

/**
 * @swagger
 * /api/employes/{employe_id}:
 *   put:
 *     summary: Update an employee by CIN
 *     tags: [Employes]
 *     parameters:
 *       - in: path
 *         name: employe_id
 *         schema:
 *           type: string
 *         required: true
 *         description: CIN of the employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Rakoto"
 *               email:
 *                 type: string
 *                 example: "rakoto@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               region:
 *                 type: string
 *                 enum: [DIANA, SAVA, ITASY, ANALAMANGA, VAKINANKARATRA, BONGOLAVA, SOFIA, BOENY, BETSIBOKA, MELAKY, ALAOTRA_MANGORO, ATSINANANA, ANALANJIROFO, AMORON_I_MANIA, HAUTE_MATSIATRA, VATOVAVY_FITOVINANY, ATSIMO_ATSINANANA, IHOROMBE, MENABE, ATSIMO_ANDREFANA, ANDROY, ANOSY]
 *                 example: "Analamanga"
 *               fonction:
 *                 type: string
 *                 enum: [MODERATEUR, ADMINISTRATEUR]
 *                 example: "ADMINISTRATEUR"
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employe'
 *       400:
 *         description: Validation error
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
 *     security:
 *       - bearerAuth: []
 */
router.put('/employes/profile/update/', IsAuthenticated, uploadPhoto, employeController.updateEmploye);

/**
 * @swagger
 * /api/employes/{employe_id}:
 *   delete:
 *     summary: Delete an employee by CIN
 *     tags: [Employes]
 *     parameters:
 *       - in: path
 *         name: employe_id
 *         schema:
 *           type: string
 *         required: true
 *         description: CIN of the employee
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
router.delete('/employes/:employe_id', IsAuthenticatedAdmin, employeController.deleteEmploye);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login an employee
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "rakoto@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/login', employeController.login);

/**
 * @swagger
 * /api/login/admin:
 *   post:
 *     summary: Login an employee
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "rakoto@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/login/admin', employeController.loginAdmin);

/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Vérifier le code OTP pour vérification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employe_id, code]
 *             properties:
 *               employe_id:
 *                 type: integer
 *                 example: 1
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP vérifié avec succès
 *       400:
 *         description: Code invalide ou expiré
 *       404:
 *         description: Employé non trouvé
 */
router.post('/verify-otp', employeController.verifyOtp);

/**
 * @swagger
 * /api/moderators/pending:
 *   get:
 *     summary: Liste des modérateurs en attente de validation (admin only)
 *     tags: [Moderateurs]
 *     responses:
 *       200:
 *         description: Liste des modérateurs pending
 *     security:
 *       - bearerAuth: []
 */
router.get('/moderators/pending/', IsAuthenticatedAdmin, employeController.getPendingModerators);

/**
 * @swagger
 * /api/moderators/pending:
 *   get:
 *     summary: Liste des modérateurs en attente de validation (admin only)
 *     tags: [Moderateurs]
 *     responses:
 *       200:
 *         description: Liste des modérateurs pending
 *     security:
 *       - bearerAuth: []
 */
router.get('/moderators/pending/:id', IsAuthenticatedAdmin, employeController.getPendingModeratorDetails);

/**
 * @swagger
 * /api/moderators/{id}/validate/:
 *   post:
 *     summary: Valider un modérateur (admin only)
 *     tags: [Moderateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Modérateur validé
 *     security:
 *       - bearerAuth: []
 */
router.post('/moderators/:id/validate/', IsAuthenticatedAdmin, employeController.validateModerator);

/**
 * @swagger
 * /api/moderators/{id}/reject/:
 *   post:
 *     summary: Rejeter un modérateur (admin only)
 *     tags: [Moderateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Modérateur rejeté
 *     security:
 *       - bearerAuth: []
 */
router.post('/moderators/:id/reject/', IsAuthenticatedAdmin, employeController.rejectModerator);
/**
 * @swagger
 * /api/logout:
 *   put:
 *     summary: Déconnexion de l'utilisateur (désactive le compte en mettant is_active à false)
 *     description: |
 *       Cette route permet à un utilisateur authentifié (admin ou modérateur) de se déconnecter.
 *       Elle met à jour le champ `is_active` à `false` dans la base de données.
 *       Note : Le token JWT reste valide jusqu'à son expiration, mais les futures requêtes seront refusées
 *       car `is_active` est vérifié par les middlewares d'authentification.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie"
 *       401:
 *         description: Non authentifié (pas de token valide ou token invalide)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/logout', IsAuthenticated, employeController.logout);

module.exports = router;