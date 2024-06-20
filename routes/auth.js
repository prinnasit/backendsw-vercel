const express = require('express');
const {register, login, getMe , logout} = require('../controllers/auth');


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs user into the system
 *     tags:
 *       - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Please provide an email and password"
 *       '401':
 *         description: Invalid credentials or error converting email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: "Invalid credentials or cannot convert email or password to string"
 */
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     description: Retrieves information about the current logged-in user.
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Not authorized to access this route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Not authorized to access this route
 */


/**
 * @swagger
 * components:
 *   securitySchemes:
 *   bearerAuth:
 *    type: http
 *    scheme: bearer
 *    bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user.
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           default: user
 *           description: The role of the user.
 *           example: user
 *         userType:
 *           type: string
 *           enum:
 *             - patient
 *             - dentist
 *           default: patient
 *           description: The type of user.
 *           example: patient
 *         password:
 *           type: string
 *           description: The password of the user.
 *           minLength: 6
 *         tel:
 *           type: string
 *           pattern: '^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$'
 *           description: The telephone number of the user.
 *           example: (123) 456-7890
 *         resetPasswordToken:
 *           type: string
 *           description: Token used for resetting password.
 *         resetPasswordExpire:
 *           type: string
 *           format: date-time
 *           description: Expiry date for the reset password token.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the user was created.
 *           example: 2024-04-30T12:00:00Z
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates whether the authentication was successful.
 *           example: true
 *         token:
 *           type: string
 *           description: JWT token for authenticated user.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *         type:
 *           type: string
 *           enum:
 *             - patient
 *             - dentist
 *           description: The type of user.
 *           example: patient
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           description: The role of the user.
 *           example: user
 */

const router = express.Router() ;

const {protect}  =require('../middleware/auth');

router.post('/register',register);
router.post('/login' , login)
router.get('/me' , protect , getMe) ;
router.get('/logout' , logout) ;

module.exports=router;