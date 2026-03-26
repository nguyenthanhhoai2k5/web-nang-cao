import Product from '../models/Product.js';
import fs from 'fs';                // Import fs
import path from 'path';            // Import path – DÒNG NÀY PHẢI CÓ
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class ProductController {
    // 1. Phải có hàm getAll (để sửa lỗi TypeError get)
    async getAll(req, res) {
        try {
            const { category, priceRange, sort, page = 1, limit = 12 } = req.query;

            let query = { isHidden: { $ne: true } };

            // Lọc danh mục
            if (category) query.category = category;

            // Lọc khoảng giá (giữ nguyên như cũ)
            if (priceRange) {
                let priceQuery = {};
                if (priceRange === '1-5') priceQuery = { $gte: 1000000, $lte: 5000000 };
                else if (priceRange === '5-10') priceQuery = { $gte: 5000000, $lte: 10000000 };
                else if (priceRange === '10-15') priceQuery = { $gte: 10000000, $lte: 15000000 };
                else if (priceRange === '15-20') priceQuery = { $gte: 15000000, $lte: 20000000 };
                else if (priceRange === '20-up') priceQuery = { $gt: 20000000 };
                if (Object.keys(priceQuery).length) query.price = priceQuery;
            }

            // Tính skip
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Query cơ bản
            let productQuery = Product.find(query)
                .populate('category', 'name')
                .skip(skip)
                .limit(parseInt(limit));

            // Sắp xếp
            if (sort === 'price-asc') productQuery = productQuery.sort({ price: 1 });
            else if (sort === 'price-desc') productQuery = productQuery.sort({ price: -1 });
            else if (sort === 'newest') productQuery = productQuery.sort({ createdAt: -1 });
            else productQuery = productQuery.sort({ createdAt: -1 }); // mặc định mới nhất

            // Lấy dữ liệu và tổng số
            const [products, totalProducts] = await Promise.all([
                productQuery.exec(),
                Product.countDocuments(query)
            ]);

            const totalPages = Math.ceil(totalProducts / limit);

            res.status(200).json({
                products,
                totalPages,
                currentPage: parseInt(page),
                totalProducts
            });
        } catch (error) {
            console.error("Lỗi getAll products:", error);
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
    // 3. Bổ sung hàm toggleHide (để không bị lỗi undefined trong routes)
    async toggleHide(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            product.status = !product.status;
            await product.save();
            res.json({ message: "Cập nhật trạng thái thành công" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 2. Sửa hàm add (Phải dùng new Product)
    // server/src/controllers/ProductController.js
    async add(req, res) {
        try {
        const { name, price, category, stock, discount, status } = req.body;

        // Parse descriptions
        let descriptionsData = [];
        if (req.body.descriptions) {
            try {
            descriptionsData = JSON.parse(req.body.descriptions);
            } catch (e) {
            return res.status(400).json({ message: 'Descriptions không valid' });
            }
        }

        // Ảnh chính
        const mainImages = req.files['images'] 
            ? req.files['images'].map(file => `/uploads/${file.filename}`)
            : [];

        // Ảnh mô tả
        descriptionsData.forEach((desc, index) => {
            const field = `descImages[${index}]`;
            const descFiles = req.files[field] || [];
            desc.images = desc.existingImages || []; // nếu có từ frontend
            desc.images.push(...descFiles.map(file => `/uploads/${file.filename}`));
        });

        const newProduct = new Product({
            name,
            price: Number(price),
            category,
            stock: Number(stock),
            discount: Number(discount),
            status: status === 'true' || status === true,
            images: mainImages,
            descriptions: descriptionsData,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Thêm thành công!' });
        } catch (error) {
        // Cleanup file nếu save fail
        Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path));
        console.error('Lỗi add:', error);
        res.status(500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        const { name, price, category, stock, discount, status } = req.body;

        product.name = name || product.name;
        product.price = price !== undefined ? Number(price) : product.price;
        product.category = category || product.category;
        product.stock = stock !== undefined ? Number(stock) : product.stock;
        product.discount = discount !== undefined ? Number(discount) : product.discount;
        product.status = status !== undefined ? (status === 'true' || status === true) : product.status;

        // Ảnh chính update
        let mainImages = [];
        if (req.body.existingMainImages) {
            try {
            const kept = JSON.parse(req.body.existingMainImages);
            // Xóa ảnh cũ không giữ
            product.images.forEach(img => {
                if (!kept.includes(img)) {
                unlinkImage(img);
                }
            });
            mainImages = kept;
            } catch (e) {
            console.error('Lỗi parse existingMainImages:', e);
            }
        }
        const newMain = req.files['images'] ? req.files['images'].map(file => `/uploads/${file.filename}`) : [];
        mainImages.push(...newMain);
        product.images = mainImages;

        // Parse descriptions
        let descriptionsData = [];
        try {
            descriptionsData = req.body.descriptions ? JSON.parse(req.body.descriptions) : product.descriptions;
        } catch (e) {
            return res.status(400).json({ message: 'Descriptions không valid' });
        }

        // Ảnh mô tả update
        descriptionsData.forEach((desc, index) => {
            const field = `descImages[${index}]`;
            const newDescImages = req.files[field] ? req.files[field].map(file => `/uploads/${file.filename}`) : [];
            let images = desc.existingImages || desc.images || [];
            // Xóa ảnh mô tả cũ không giữ
            if (desc.existingImages) {
            const oldDescImages = product.descriptions[index]?.images || [];
            oldDescImages.forEach(img => {
                if (!images.includes(img)) {
                unlinkImage(img);
                }
            });
            }
            images.push(...newDescImages);
            desc.images = images;
        });
        product.descriptions = descriptionsData;
        await product.save();
        res.status(200).json({ message: 'Cập nhật thành công!', product });
        } catch (error) {
        // Cleanup new files nếu fail
        if (req.files) Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path));
        console.error('Lỗi update sản phẩm:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
        }
    }

    async delete(req, res) {
        try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        // Xóa ảnh chính
        product.images.forEach(img => unlinkImage(img));

        // Xóa ảnh mô tả
        product.descriptions.forEach(desc => {
            desc.images.forEach(img => unlinkImage(img));
        });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
        console.error('Lỗi delete sản phẩm:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
        }
    }
    // server/src/controllers/ProductController.js
    // server/src/controllers/ProductController.js
    async getById(req, res) {
        try {
            const product = await Product.findById(req.params.id).populate('category');
            if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
// Helper unlink an toàn
function unlinkImage(img) {
  if (!img) return;

  // img thường là '/uploads/filename.jpg' → loại bỏ /uploads/ để lấy tên file
  const filename = img.startsWith('/uploads/') ? img.replace('/uploads/', '') : img;

  // Đường dẫn đầy đủ: từ controllers → lên src → lên server → vào uploads
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Đã xóa file thành công:', filePath);
  } else {
    console.warn('File không tồn tại (có thể đã xóa trước):', filePath);
  }
}

export default new ProductController();