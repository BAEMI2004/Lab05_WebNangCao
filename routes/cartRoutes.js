const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// 🛒 Xem giỏ hàng
router.get('/', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    
    let cart = req.session.cart;
    let totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    console.log("📌 Giỏ hàng hiện tại:", cart);
    
    res.render('cart', { cart, totalPrice });
});

// ➕ Thêm sản phẩm vào giỏ hàng
router.post('/add/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) {
            console.error("⚠ Sản phẩm không tồn tại! ID:", req.params.id);
            return res.status(404).send("Sản phẩm không tồn tại!");
        }

        if (!req.session.cart) req.session.cart = [];

        let cart = req.session.cart;
        let existingItem = cart.find(item => item._id === req.params.id);

        if (existingItem) {
            existingItem.quantity += 1;
            console.log(`🔄 Tăng số lượng sản phẩm "${existingItem.name}" lên ${existingItem.quantity}`);
        } else {
            cart.push({
                _id: req.params.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            console.log(`✅ Đã thêm sản phẩm "${product.name}" vào giỏ hàng!`);
        }

        req.session.save(() => {
            res.redirect('/cart');
        });
    } catch (error) {
        console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).send("Lỗi server khi thêm sản phẩm vào giỏ hàng!");
    }
});

// ❌ Xóa sản phẩm khỏi giỏ hàng
router.post('/remove/:id', (req, res) => {
    if (!req.session.cart) req.session.cart = [];

    let cart = req.session.cart;
    console.log("🗑 Trước khi xóa:", cart);
    
    req.session.cart = cart.filter(item => item._id !== req.params.id);

    console.log("🗑 Sau khi xóa:", req.session.cart);
    
    req.session.save(() => {
        res.redirect('/cart');
    });
});

// 🔄 Cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/update/:id', (req, res) => {
    if (!req.session.cart) req.session.cart = [];

    let cart = req.session.cart;
    let { quantity } = req.body;
    quantity = parseInt(quantity);

    let item = cart.find(item => item._id === req.params.id);
    if (item) {
        if (quantity <= 0) {
            req.session.cart = cart.filter(i => i._id !== req.params.id);
            console.log(`🗑 Đã xóa sản phẩm "${item.name}" do số lượng bằng 0`);
        } else {
            item.quantity = quantity;
            console.log(`🔄 Cập nhật số lượng sản phẩm "${item.name}" thành ${item.quantity}`);
        }
    } else {
        console.warn(`⚠ Không tìm thấy sản phẩm ID: ${req.params.id} để cập nhật`);
    }

    req.session.save(() => {
        res.redirect('/cart');
    });
});

module.exports = router;
