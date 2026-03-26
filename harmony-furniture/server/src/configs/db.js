import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    constructor() {
        this._connect();
    }

    async _connect() {
        try {
            // Sử dụng MONGO_URI từ .env [cite: 3]
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Kết nối Database Harmony thành công!');
        } catch (err) {
            console.error('❌ Lỗi kết nối Database:', err.message);
            process.exit(1);
        }
    }
}

export default new Database();