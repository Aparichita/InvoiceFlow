// src/routes/invoice.routes.js
import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  generateInvoicePDF,
} from "../controllers/invoice.controller.js";

const router = express.Router();

// CRUD routes
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);

// PDF generation
router.post("/:id/pdf", generateInvoicePDF);

export default router;
