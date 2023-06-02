import express from 'express';
import * as controller from './borrowController.js';
import * as auth from './middlewares/auth.js';

const router = express.Router();

// Get all borrows
router.get('/', auth.newAuthenticator(), controller.findAll);

// Get specific borrows by id
router.get('/:id', auth.newAuthenticator(), controller.findById);

// Borrow new book
router.post(
  '/borrow',
  auth.newAuthenticator(),
  auth.newRoleAuthorizer('STUDENT'),
  controller.borrowBook
);

// Return borrowed book
router.post(
  '/return',
  auth.newAuthenticator(),
  auth.newRoleAuthorizer('STUDENT'),
  controller.returnBook
);

export default router;
