import mongoose from 'mongoose';


// Đối tượng Schema cho sản phẩm có nhiều thuộc tính khác nhau
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Nếu bạn lỡ để 'description' là required, hãy đổi tên hoặc bỏ required
    description: { type: String }, 
    descriptions: [
        {
            title: String,
            content: String,
            images: [String]
        }
    ],
    price: { 
        type: Number, 
        required: [true, 'Giá sản phẩm là bắt buộc'],
        min: 0 
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }, 
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    images: [{ 
        type: String // Lưu URL ảnh sản phẩm 
    }],
    video: { 
        type: String // Lưu URL video giới thiệu 
    },
    colors: [{ 
        type: String, 
        default: ['#F5F5DC', '#FFFFF0', '#556B2F', '#FFD700'] // Các màu chủ đạo của dự án [cite: 55, 58, 61, 64]
    }],
    stock: { 
        type: Number, 
        default: 0 
    },
    isAvailable: { 
        type: Boolean, 
        default: true // Dùng để ẩn/hiện sản phẩm 
    },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { 
    timestamps: true // Tự động tạo createdAt và updatedAt
});

// Tạo Model từ Schema
const Product = mongoose.model('Product', productSchema);

export default Product;