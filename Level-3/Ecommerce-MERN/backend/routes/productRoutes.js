const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get All Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add New Product
router.post('/', async (req, res) => {
    try {
        const { name, price, description, category, image } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ message: "Name, price, and category are required." });
        }

        const newProduct = new Product({
            name,
            price: Number(price),
            description: description || '',
            category,
            image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;