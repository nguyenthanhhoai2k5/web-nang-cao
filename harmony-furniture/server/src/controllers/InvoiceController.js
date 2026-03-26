import Invoice from '../models/Invoice.js';

const InvoiceController = {
    // 1. LẤY DANH SÁCH HÓA ĐƠN (Xem hóa đơn)
    getAllInvoices: async (req, res) => {
        try {
            // Sắp xếp hóa đơn mới nhất lên đầu
            const invoices = await Invoice.find().sort({ createdAt: -1 });
            res.status(200).json(invoices);
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách hóa đơn", error });
        }
    },

    // 2. TẠO HÓA ĐƠN MỚI (Có logic tự tạo mã HD)
    // server/src/controllers/InvoiceController.js
    createInvoice: async (req, res) => {
        try {
            const count = await Invoice.countDocuments();
            // Tạo mã HD001, HD002...
            const invoiceNo = `HD${(count + 1).toString().padStart(3, '0')}`;

            const newInvoice = new Invoice({
                ...req.body,
                invoiceNo: invoiceNo // Ghi đè mã tự sinh từ server
            });

            await newInvoice.save();
            res.status(201).json(newInvoice);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // 3. LẤY CHI TIẾT 1 HÓA ĐƠN
    getInvoiceById: async (req, res) => {
        try {
            const invoice = await Invoice.findById(req.params.id).populate('items.productId', 'sku');
            if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            res.status(200).json(invoice);
            invoice.items = invoice.items.map(item => ({
                ...item.toObject(),
                sku: item.productId?.sku || 'N/A'
            }));
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống", error });
        }
    },

    // 4. CẬP NHẬT HÓA ĐƠN (Sửa hóa đơn)
    updateInvoice: async (req, res) => {
        try {
            const { items } = req.body;
            let updateData = { ...req.body };

            // Nếu có sửa đổi items, tính lại tổng tiền
            if (items) {
                updateData.totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }

            const updatedInvoice = await Invoice.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true } // Trả về dữ liệu sau khi sửa
            );

            if (!updatedInvoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            res.status(200).json(updatedInvoice);
        } catch (error) {
            res.status(400).json({ message: "Lỗi khi cập nhật hóa đơn", error });
        }
    },

    // 5. XÓA HÓA ĐƠN
    deleteInvoice: async (req, res) => {
        try {
            const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
            if (!deletedInvoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn để xóa" });
            res.status(200).json({ message: "Đã xóa hóa đơn thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi xóa hóa đơn", error });
        }
    }
};

export default InvoiceController;