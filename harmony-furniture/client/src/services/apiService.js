import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiService = {
    // Categories
    getCategories: () => axios.get(`${API_URL}/categories`),
    addCategory: (data) => axios.post(`${API_URL}/categories`, data),
    updateCategory: (id, data) => axios.put(`${API_URL}/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`${API_URL}/categories/${id}`),

    // Products
    getProductById: (id) => axios.get(`${API_URL}/products/${id}`),
    deleteProduct: (id) => axios.delete(`${API_URL}/products/${id}`),
    
    // Logic upload ảnh (Sử dụng FormData như bạn yêu cầu)
    saveProduct: async (productData, images, isEdit = false) => {
        const formData = new FormData();
        // Append các field thông thường
        Object.keys(productData).forEach(key => {
            if (key === 'descriptions') {
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });
        // Append tối đa 7 ảnh sản phẩm
        images.forEach(file => formData.append('images', file));

        if (isEdit) {
            return axios.put(`${API_URL}/products/${productData.id}`, formData);
        }
        return axios.post(`${API_URL}/products`, formData);
    }
};