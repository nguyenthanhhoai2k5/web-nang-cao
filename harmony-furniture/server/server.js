import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Hoặc import dotenv from 'dotenv'; dotenv.config();
import './src/configs/db.js'; 
import categoryRoutes from './src/routes/categoryRoutes.js'; 
import authRoutes from './src/routes/authRoutes.js'; 
import productRoutes from './src/routes/productRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js'; // route giỏ hàng 
import orderRoutes from './src/routes/orderRoutes.js'; // route đơn hàng
import invoiceRoutes from './src/routes/InvoiceRoutes.js';
import userRoutes from './src/routes/userRoutes.js'; 

const app = express();
const PORT = 3000; 

// --- CÁC MIDDLEWARE CHUNG (Phải đặt trên cùng) ---
app.use(cors());
app.use(express.json()); // Phải đặt TRƯỚC các routes để đọc được req.body

// --- CÁC ROUTES API ---
app.use('/api/auth', authRoutes); // route xác thực
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contacts', contactRoutes);   // route liên hệ
app.use('/api/cart', cartRoutes); // route giỏ hàng 
app.use('/api/orders', orderRoutes); // route đơn hàng
app.use('/uploads', express.static('uploads')); // Cho phép truy cập thư mục uploads để lấy ảnh sản phẩm
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);    // Dùng cho quản lý tài khoản (Đường dẫn sẽ là /api/users)
app.use(cors());

app.get('/', (req, res) => {
    res.send('Chào mừng bạn đến với Harmony Furniture API!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang vận hành tại http://localhost:${PORT}`);
});