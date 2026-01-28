const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employe.controller');
const { IsAuthenticated, IsAuthenticatedAdmin } = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * /api/register/admin:
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
router.post('/register/admin', employeController.addEmploye);

/**
 * @swagger
 * /api/employes:
 *   get:
 *     summary: Get all employees or filter by name
 *     tags: [Employes]
 *     parameters:
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter employees by name (partial match)
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employe'
 *       400:
 *         description: Error retrieving employees
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
router.get('/employes', employeController.getAllEmploye);

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
router.get('/employes/profile/:employe_id', IsAuthenticated, employeController.getOneEmploye);

/**
 * @swagger
 * /api/employes/profile:
 *   get:
 *     summary: Get an employee by CIN
 *     tags: [Employes]
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
router.put('/employes/profile/update/', IsAuthenticated, employeController.updateEmploye);

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
router.delete('/employes/:employe_id', employeController.deleteEmploye);

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

module.exports = router;