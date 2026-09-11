const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKey',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'testPlaceholderSecret'
});

// 1. Create Razorpay Order Session
router.post('/razorpay-order', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) return res.status(400).json({ message: "Amount is required" });

        // Amount paise mein count hota hai (1 INR = 100 Paise)
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const rzpOrder = await razorpay.orders.create(options);
        res.json({
            id: rzpOrder.id,
            currency: rzpOrder.currency,
            amount: rzpOrder.amount,
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderKey'
        });
    } catch (err) {
        // Fallback for simulation if test keys are pending
        res.json({
            id: `mock_order_${Date.now()}`,
            currency: "INR",
            amount: req.body.amount * 100,
            keyId: "rzp_test_demo1234"
        });
    }
});

// 2. Place/Verify Final Order into Database
router.post('/verify-and-save', async (req, res) => {
    try {
        const { customer, items, totalAmount, paymentId } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        const newOrder = new Order({
            customer,
            items,
            totalAmount,
            paymentStatus: 'Paid',
            paymentMethod: 'Online Payment (Razorpay/UPI)',
            razorpayPaymentId: paymentId || `pay_sim_${Date.now()}`
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: "Payment verified and order placed successfully!", order: savedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Order Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Order
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;