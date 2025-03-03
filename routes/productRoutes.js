import express from 'express';
import Product from '../models/product.js'; // Đảm bảo file model đúng

const router = express.Router();

// 🛒 Lấy danh sách sản phẩm và render trang EJS
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        console.log("📌 Danh sách sản phẩm trong database:", products); // ✅ Kiểm tra số lượng sản phẩm
        
        const cart = req.session.cart || []; // Lấy giỏ hàng từ session
        res.render('products', { products, cart });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
        res.status(500).send("Lỗi server");
    }
});

// 🔍 Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Sản phẩm không tồn tại!");
        }
        const cart = req.session.cart || [];
        res.render('product-detail', { product, cart });
    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
        res.status(500).send("Lỗi server");
    }
});

// ➕ API thêm sản phẩm (hỗ trợ Postman)
router.post('/add', async (req, res) => {
    try {
        const { name, price, description, image } = req.body;

        if (!name || !price || !description || !image) {
            return res.status(400).json({ error: "Thiếu thông tin sản phẩm!" });
        }
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ error: "Giá sản phẩm không hợp lệ!" });
        }

        const newProduct = new Product({ name, price, description, image });
        await newProduct.save();

        res.status(201).json({ message: "Sản phẩm đã được thêm!", product: newProduct });
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ error: "Lỗi server khi thêm sản phẩm!" });
    }
});

// 🗑 Xóa sản phẩm theo ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Sản phẩm đã được xóa!" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ error: "Lỗi server khi xóa sản phẩm!" });
    }
});

// ✏️ Cập nhật sản phẩm theo ID
router.put('/update/:id', async (req, res) => {
    try {
        const { name, price, description, image } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description, image },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
        }

        res.json({ message: "Sản phẩm đã được cập nhật!", updatedProduct });
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm!" });
    }
});

// 🛒 API lấy danh sách sản phẩm cho Postman
router.get('/api/list', async (req, res) => {
    try {
        const products = await Product.find();
        console.log("📌 Sản phẩm trả về API:", products);

        res.status(200).json({ products });
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm!" });
    }
});

export default router;
