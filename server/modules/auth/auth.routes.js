import express from 'express';
import { register, login, getProfile } from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getProfile);

export default router;
