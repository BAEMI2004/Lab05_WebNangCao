import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

const app = express();

// 🛠 Kiểm tra biến môi trường
if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI chưa được thiết lập trong .env!");
  process.exit(1);
}

// 📡 Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// ⚙️ Cấu hình middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Hỗ trợ JSON
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY || 'ecommerceSecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Để true nếu dùng HTTPS
}));

// 🖥 Cấu hình View Engine (EJS)
app.set('view engine', 'ejs');

// 🔗 Định tuyến
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

app.get('/', (req, res) => {
  res.redirect('/products');
});

// ⚠️ Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).send("Có lỗi xảy ra trên server!");
});

// 🚀 Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
