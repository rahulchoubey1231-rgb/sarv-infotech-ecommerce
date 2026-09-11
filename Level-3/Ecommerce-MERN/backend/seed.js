const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const sampleProducts = [
    {
        name: "Wireless Noise Cancelling Headphones",
        price: 2999,
        description: "High quality wireless over-ear headphones with deep bass.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics"
    },
    {
        name: "Smart Fitness Watch",
        price: 1999,
        description: "Waterproof fitness tracker with heart rate and sleep monitor.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Wearables"
    },
    {
        name: "Ergonomic Gaming Mouse",
        price: 999,
        description: "RGB gaming mouse with customizable DPI buttons.",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        category: "Accessories"
    }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
      console.log("MongoDB Connected for seeding...");
      await Product.deleteMany({});
      await Product.insertMany(sampleProducts);
      console.log("Dummy Products Added Successfully!");
      process.exit(0);
  })
  .catch((err) => {
      console.error("Seeding Error:", err.message);
      process.exit(1);
  });