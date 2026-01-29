const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gestion de PPN API',
            version: '1.0.0',
            description: 'API for managing employees and stock inventory',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Employe: {
                    type: 'object',
                    required: ['cin', 'nom', 'email', 'password', 'region', 'fonction'],
                    properties: {
                        cin: {
                            type: 'string',
                            description: 'Unique 12-digit CIN of the employee',
                            example: '123456789012',
                        },
                        nom: {
                            type: 'string',
                            description: 'Name of the employee (max 50 characters)',
                            example: 'Rakoto',
                        },
                        email: {
                            type: 'string',
                            description: 'Email address of the employee (max 50 characters)',
                            example: 'rakoto@example.com',
                        },
                        password: {
                            type: 'string',
                            description: 'Hashed password of the employee',
                            example: '$2b$10$...',
                        },
                        region: {
                            type: 'string',
                            enum: [
                                'Diana', 'Sava', 'Itasy', 'Analamanga', 'Vakinankaratra',
                                'Bongolava', 'Sofia', 'Boeny', 'Betsiboka', 'Melaky',
                                'Alaotra-Mangoro', 'Atsinanana', 'Analanjirofo', "Amoron'i Mania",
                                'Haute Matsiatra', 'Vatovavy-Fitovinany', 'Atsimo-Atsinanana',
                                'Ihorombe', 'Menabe', 'Atsimo-Andrefana', 'Androy', 'Anosy',
                            ],
                            description: 'Region of the employee in Madagascar',
                            example: 'Analamanga',
                        },
                        fonction: {
                            type: 'string',
                            enum: ['MODERATEUR', 'ADMINISTRATEUR'],
                            description: 'Role of the employee',
                            example: 'MODERATEUR',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        erreur: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Tous les champs sont requis',
                        },
                    },
                },
                Message: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Success or error message',
                            example: 'Employé supprimé avec succès.',
                        },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: {
                            type: 'string',
                            description: 'JWT token for authentication',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                        fonction: {
                            type: 'string',
                            description: 'Fonction de l\'utilisateur',
                            example: 'MODERATEUR...',
                        },
                        region: {
                            type: 'string',
                            description: 'Region d\'enregistrement de l\'utilisateur',
                            example: 'Haute Matsiatra',
                        },
                    },
                },
            },
        },
    },
    apis: ['./apps/routes/*.js'], // Correct path to scan employe_route.js and stocke_route.js
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };