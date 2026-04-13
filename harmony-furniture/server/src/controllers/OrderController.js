import User from '../models/User.js';
import Product from '../models/Product.js';
import orderSchema from '../models/Order.js';
import Order from '../models/Order.js';

class OrderController {
    // 1. Tạo đơn hàng (Cho cả User và Guest)
    async createOrder(req, res) {
        try {
            const { items, fullName, phone, email, address } = req.body;
            const userId = req.user ? req.user.id : null;

            // Tính toán lại totalAmount từ items và lưu thông tin discount
            let calculatedTotalAmount = 0;
            const processedItems = [];
            
            // Duyệt qua từng item để tính giá sau giảm giá
            for (const item of items) {
                // Lấy thông tin sản phẩm từ database để có giá và discount mới nhất
                const product = await Product.findById(item.productId).select('name price discount images');
                
                if (product) {
                    // Lấy discount từ sản phẩm (nếu có)
                    const discount = product.discount || 0;
                    
                    // Tính giá gốc và giá sau giảm giá
                    const originalPrice = product.price;
                    const discountedPrice = originalPrice * (100 - discount) / 100;
                    
                    // Cộng dồn vào tổng tiền
                    calculatedTotalAmount += discountedPrice * item.quantity;
                    
                    // Tạo item với đầy đủ thông tin để lưu vào order
                    processedItems.push({
                        productId: product._id,
                        name: product.name,
                        originalPrice: originalPrice, // Lưu giá gốc
                        price: discountedPrice, // Lưu giá đã giảm
                        discount: discount, // Lưu % giảm giá
                        quantity: item.quantity,
                        image: product.images?.[0] || ''
                    });
                } else {
                    // Nếu không tìm thấy sản phẩm, dùng thông tin từ client
                    processedItems.push({
                        productId: item.productId,
                        name: item.name || 'Sản phẩm không xác định',
                        originalPrice: item.price || 0,
                        price: item.price || 0,
                        discount: 0,
                        quantity: item.quantity,
                        image: item.image || ''
                    });
                    calculatedTotalAmount += (item.price || 0) * item.quantity;
                }
            }

            // Tạo đơn hàng mới
            const newOrder = new Order({
                userId: userId,
                fullName: fullName,
                phone: phone,
                email: email,
                address: address,
                items: processedItems, // Dùng items đã xử lý
                totalAmount: calculatedTotalAmount,
                status: 'pending'
            });

            await newOrder.save();

            res.status(201).json({ 
                message: "Đặt hàng thành công!", 
                orderId: newOrder._id,
                totalAmount: calculatedTotalAmount
            });

        } catch (error) {
            console.error("Lỗi createOrder:", error);
            res.status(500).json({ 
                message: "Lỗi đặt hàng", 
                error: error.message 
            });
        }
    }

    // 2. Admin: Lấy danh sách tất cả đơn hàng để duyệt
    //hàm getAllOrders
    async getAllOrders(req, res) {
        try {
            const orders = await Order.find()
                .sort({ createdAt: -1 })
                .populate('items.productId', 'name price discount images'); // Populate để lấy thêm thông tin nếu cần
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng", error: error.message });
        }
    }

    // hàm getAdminOrders
    async getAdminOrders(req, res) {
        try {
            const { status, search, page = 1 } = req.query;
            let query = {};
            if (status === 'unviewed') query.isViewed = false;
            else if (status) query.status = status;
            
            if (search) query.fullName = new RegExp(search, 'i');

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * 10)
                .limit(10)
                .populate('items.productId', 'name price discount images'); // Populate để lấy thêm thông tin

            const total = await Order.countDocuments();
            const unviewed = await Order.countDocuments({ isViewed: false });
            const approved = await Order.countDocuments({ status: 'approved' });
            const pending = await Order.countDocuments({ status: 'pending' });

            res.json({ orders, stats: { total, unviewed, approved, pending } });
        } catch (error) {
            console.error("Lỗi getAdminOrders:", error);
            console.log("Order items sample:", orders[0]?.items[0]); // Xem cấu trúc dữ liệu
            res.status(500).json({ message: error.message });
        }
    }

    // Duyệt/Từ chối đơn hàng
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;    

            const order = await Order.findById(id);
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

            const oldStatus = order.status;

            // Khi duyệt đơn, cập nhật kho với giá đã tính giảm giá
            if (oldStatus === 'pending' && status === 'approved') {
                for (const item of order.items) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        if (product.stock < item.quantity) {
                            return res.status(400).json({ 
                                message: `Sản phẩm ${product.name} không đủ tồn kho (Hiện có: ${product.stock})` 
                            });
                        }
                        product.stock -= item.quantity;
                        await product.save();
                    }
                }
            }

            // Khi hủy đơn đã duyệt, cộng lại kho
            if (oldStatus === 'approved' && status === 'cancelled') {
                for (const item of order.items) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.stock += item.quantity;
                        await product.save();
                    }
                }
            }

            order.status = status;
            order.isViewed = true;
            await order.save();

            res.status(200).json({ 
                message: `Đã chuyển trạng thái sang: ${status}`,
                order 
            });

        } catch (error) {
            console.error("Lỗi updateStatus:", error);
            res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
        }
    }

    async getRevenueStats(req, res) {
        try {
            const { year, monthA, monthB } = req.query;
            const yearNum = Number(year) || new Date().getFullYear();

            // 3. Top 10 sản phẩm bán chạy
            const topProducts = await Order.aggregate([
                { $match: { status: 'approved' } },
                { $unwind: "$items" },
                { $group: { _id: "$items.productId", name: { $first: "$items.name" }, totalQty: { $sum: "$items.quantity" } } },
                { $sort: { totalQty: -1 } },
                { $limit: 10 }
            ]);

            // 4. Top 10 khách hàng thân thiết
            const topCustomers = await Order.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: "$email", fullName: { $first: "$fullName" }, totalItems: { $sum: { $size: "$items" } } } },
                { $sort: { totalItems: -1 } },
                { $limit: 10 }
            ]);

            // Chuẩn bị top 4 để vẽ biểu đồ (nếu ít thì lấy số có sẵn)
            const top4 = topProducts.slice(0, 4);
            const top4Ids = top4.map(p => p._id);

            // Hàm tính doanh thu theo tháng cho các sản phẩm trong top4
            const computeMonthRevenue = async (month) => {
                if (!month) return top4.map(() => 0);
                const monthNum = Number(month);
                const agg = await Order.aggregate([
                    { $match: { status: 'approved', $expr: { $and: [ { $eq: [ { $year: "$createdAt" }, yearNum ] }, { $eq: [ { $month: "$createdAt" }, monthNum ] } ] } } },
                    { $unwind: "$items" },
                    { $group: { _id: "$items.productId", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
                    { $match: { _id: { $in: top4Ids } } }
                ]);

                const map = {};
                agg.forEach(a => { map[a._id.toString()] = a.revenue; });
                return top4.map(p => map[p._id.toString()] || 0);
            };

            const dataA = await computeMonthRevenue(monthA);
            const dataB = await computeMonthRevenue(monthB);

            res.json({ topProducts, topCustomers, dataA, dataB });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Lấy đơn hàng của user đang đăng nhập
    async getUserOrders(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });
            const orders = await Order.find({ userId }).sort({ createdAt: -1 });
            res.status(200).json(orders);
        } catch (error) {
            console.error('Lỗi getUserOrders:', error);
            res.status(500).json({ message: error.message });
        }
    }
    // Cập nhật trạng thái đơn hàng thành "Đã nhận hàng"
    async markAsReceived(req, res) {
        try {
            const { orderId } = req.params;
            const { productId } = req.body;
            if (!productId) return res.status(400).json({ message: 'productId is required' });

            const order = await Order.findOne({ _id: orderId, userId: req.user.id });
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

            // Tìm item bên trong đơn và gán trạng thái received
            const item = order.items.find(i => i.productId?.toString() === productId.toString());
            if (!item) return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong đơn hàng' });

            item.status = 'received';
            await order.save();

            res.status(200).json({ message: "Xác nhận nhận hàng thành công", order });
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}

export default new OrderController();