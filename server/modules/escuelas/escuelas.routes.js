import express from 'express';
import { getEscuelas } from './escuelas.controller.js';

const router = express.Router();

router.get('/', getEscuelas);

export default router;
