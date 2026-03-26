// Class này xử lý các hành động thêm, xóa và lấy thông tin giỏ hàng. 
import Cart from '../models/Cart.js';

class CartController {
    // 1. Lấy giỏ hàng của User
    async getCart(req, res) {
        try {
            let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
            if (!cart) {
                cart = await Cart.create({ user: req.user.id, items: [] });
            }
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: error.message });
        }
    }

    // 2. Thêm sản phẩm vào giỏ hàng
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            let cart = await Cart.findOne({ user: req.user.id });

            if (!cart) {
                cart = new Cart({ user: req.user.id, items: [] });
            }

            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity || 1;
            } else {
                cart.items.push({ product: productId, quantity: quantity || 1 });
            }

            await cart.save();
            res.status(200).json({ message: "Đã thêm vào giỏ hàng", data: cart });
        } catch (error) {
            res.status(500).json({ message: "Lỗi thêm giỏ hàng", error: error.message });
        }
    }

    // 3. Xóa một sản phẩm khỏi giỏ hàng
    async removeFromCart(req, res) {
        try {
            const { productId } = req.params;
            let cart = await Cart.findOne({ user: req.user.id });

            if (cart) {
                cart.items = cart.items.filter(item => item.product.toString() !== productId);
                await cart.save();
            }
            res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", data: cart });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi xóa", error: error.message });
        }
    }
    // 4. Cập nhât vào giỏ hàng. 
    async updateCartItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.id; // Lấy từ verifyToken

            const cart = await Cart.findOne({ userId });
            if (!cart) return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });

            const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
                await cart.save();
                return res.status(200).json(cart);
            }
            res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật số lượng" });
        }
    }
}

export default new CartController();