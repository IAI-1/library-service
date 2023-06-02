import express from 'express';
import * as controller from './bookController.js';
import * as auth from './middlewares/auth.js';

const router = express.Router();

// Get all books
router.get('/', controller.findAll);

// Get specific book by id
router.get('/:id', controller.findById);

// Create new book
router.post(
  '/',
  auth.newAuthenticator(),
  auth.newRoleAuthorizer('ADMIN'),
  controller.create
);

// Update specific book by id
router.put(
  '/:id',
  auth.newAuthenticator(),
  auth.newRoleAuthorizer('ADMIN'),
  controller.updateById
);

// Delete specific book by id
router.delete(
  '/:id',
  auth.newAuthenticator(),
  auth.newRoleAuthorizer('ADMIN'),
  controller.deleteById
);

export default router;
