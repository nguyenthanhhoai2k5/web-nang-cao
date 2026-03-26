import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../css/admin-products.module.css';

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State thông tin cơ bản sản phẩm
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    discount: 0,
    status: true,
  });

  // State danh mục
  const [categories, setCategories] = useState([]);

  // Ảnh chính: ảnh cũ (URL từ server) và ảnh mới (File object)
  const [oldMainImages, setOldMainImages] = useState([]); // mảng string URL
  const [selectedMainFiles, setSelectedMainFiles] = useState([]); // mảng File

  // Mô tả chi tiết: mỗi item có title, content, và ảnh (old + new)
  const [descriptions, setDescriptions] = useState([
    { title: '', content: '', oldImages: [], selectedFiles: [] },
  ]);

  // Loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy danh mục
        const catRes = await axios.get('http://localhost:3000/api/categories');
        setCategories(catRes.data);

        // 2. Nếu là edit → lấy thông tin sản phẩm
        if (isEdit && id) {
          console.log('Đang lấy dữ liệu sản phẩm cho ID:', id);
          const res = await axios.get(`http://localhost:3000/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          const p = res.data;

          // Đổ dữ liệu cơ bản
          setProductData({
            name: p.name || '',
            category: p.category?._id || p.category || (catRes.data[0]?._id || ''),
            stock: Number(p.stock) || 0,
            price: Number(p.price) || 0,
            discount: Number(p.discount) || 0,
            status: p.status !== false,
          });

          // Đổ mô tả (bao gồm ảnh cũ cho từng mô tả)
          if (p.descriptions && Array.isArray(p.descriptions) && p.descriptions.length > 0) {
            setDescriptions(
              p.descriptions.map((desc) => ({
                title: desc.title || '',
                content: desc.content || '',
                oldImages: desc.images || [], // ảnh cũ cho mô tả
                selectedFiles: [], // ảnh mới ban đầu rỗng
              }))
            );
          }

          // Đổ ảnh chính cũ
          if (p.images && Array.isArray(p.images)) {
            setOldMainImages(p.images);
          }
        } else {
          // Add mới: mặc định chọn danh mục đầu tiên nếu có
          if (catRes.data.length > 0) {
            setProductData((prev) => ({ ...prev, category: catRes.data[0]._id }));
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert(
          error.response?.status === 404
            ? 'Không tìm thấy sản phẩm để chỉnh sửa'
            : 'Lỗi kết nối server. Vui lòng kiểm tra backend.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addDescription = () => {
    setDescriptions((prev) => [
      ...prev,
      { title: '', content: '', oldImages: [], selectedFiles: [] },
    ]);
  };

  const handleDescChange = (index, field, value) => {
    const newDescs = [...descriptions];
    newDescs[index][field] = value;
    setDescriptions(newDescs);
  };

  // Upload ảnh chính
  const handleMainFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = oldMainImages.length + selectedMainFiles.length + files.length;

    if (total > 7) {
      alert(`Tổng số ảnh không được vượt quá 7 (hiện tại: ${total})`);
      return;
    }

    setSelectedMainFiles((prev) => [...prev, ...files]);
  };

  const removeOldMainImage = (index) => {
    setOldMainImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewMainFile = (index) => {
    setSelectedMainFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload ảnh cho mô tả chi tiết (tối đa 2 per desc)
  const handleDescFileChange = (descIndex, e) => {
    const files = Array.from(e.target.files);
    const desc = descriptions[descIndex];
    const total = desc.oldImages.length + desc.selectedFiles.length + files.length;

    if (total > 2) {
      alert(`Tổng số ảnh cho mô tả này không được vượt quá 2 (hiện tại: ${total})`);
      return;
    }

    const newDescs = [...descriptions];
    newDescs[descIndex].selectedFiles = [...desc.selectedFiles, ...files];
    setDescriptions(newDescs);
  };

  const removeOldDescImage = (descIndex, imgIndex) => {
    const newDescs = [...descriptions];
    newDescs[descIndex].oldImages = newDescs[descIndex].oldImages.filter(
      (_, i) => i !== imgIndex
    );
    setDescriptions(newDescs);
  };

  const removeNewDescFile = (descIndex, fileIndex) => {
    const newDescs = [...descriptions];
    newDescs[descIndex].selectedFiles = newDescs[descIndex].selectedFiles.filter(
      (_, i) => i !== fileIndex
    );
    setDescriptions(newDescs);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!productData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    if (!productData.category) {
      alert('Vui lòng chọn loại sản phẩm!');
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Thông tin cơ bản
    formData.append('name', productData.name);
    formData.append('category', productData.category);
    formData.append('stock', productData.stock);
    formData.append('price', productData.price);
    formData.append('discount', productData.discount);
    formData.append('status', productData.status);

  // Ảnh chính mới
  selectedMainFiles.forEach((file) => {
    formData.append('images', file); // Thay mainImages về images
  });

    // Ảnh chính cũ giữ lại (chỉ khi edit)
    if (isEdit) {
      formData.append('existingMainImages', JSON.stringify(oldMainImages));
    }

    // Mô tả: JSON hóa title/content, và gửi ảnh riêng cho từng mô tả
    const descData = descriptions.map((desc) => ({
      title: desc.title,
      content: desc.content,
      existingImages: desc.oldImages, // ảnh cũ cho mô tả
    }));
    formData.append('descriptions', JSON.stringify(descData));

    // Ảnh mô tả mới: gửi với field descImages[index][]
    descriptions.forEach((desc, descIndex) => {
      desc.selectedFiles.forEach((file) => {
        formData.append(`descImages[${descIndex}]`, file);
      });
    });

    try {
      const url = isEdit
        ? `http://localhost:3000/api/products/${id}`
        : 'http://localhost:3000/api/products/add';

      const method = isEdit ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      alert(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      alert(
        error.response?.data?.message ||
          'Không thể lưu sản phẩm. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles['product-form-page']}>
      <div className={styles['form-header-align-left']}>
        <button className={styles['btn-back']} onClick={() => navigate(-1)}>
          {'<<< Trở về'}
        </button>
        <h1>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}</h1>
      </div>

      <div className={styles['form-container-centered']}>
        <form className={styles['admin-form-styled']} onSubmit={handleSave}>
          <div className={styles['form-grid']}>
            <div className={styles['form-group']}>
              <label>ID Sản phẩm</label>
              <input placeholder="ID (Tự động)" disabled value={id || ''} />
            </div>

            <div className={styles['form-group']}>
              <label>Tên sản phẩm *</label>
              <input
                name="name"
                required
                value={productData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles['form-group']}>
              <label>Loại sản phẩm *</label>
              <select
                name="category"
                value={productData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Chọn loại --</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles['form-group']}>
              <label>Số lượng</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={productData.stock}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles['form-group']}>
              <label>Giá bán (VNĐ)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={productData.price}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles['form-group']}>
              <label>Giảm giá (%)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={productData.discount}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles['image-upload-section']}>
            <label>Ảnh sản phẩm chính (tối đa 7 ảnh)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMainFileChange}
            />

            <div className={styles['preview-images']}>
              {/* Ảnh cũ chính */}
              {oldMainImages.map((img, index) => (
                <div key={`old-main-${index}`} className={styles['preview-item']}>
                  <img src={`http://localhost:3000${img}`} alt="Ảnh cũ" width="120" />
                  <button
                    type="button"
                    className={styles['btn-remove-circle']}
                    onClick={() => removeOldMainImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Ảnh mới chính */}
              {selectedMainFiles.map((file, index) => (
                <div key={`new-main-${index}`} className={styles['preview-item']}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Ảnh mới"
                    width="120"
                  />
                  <button
                    type="button"
                    className={styles['btn-remove-circle']}
                    onClick={() => removeNewMainFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <small>
              Tổng ảnh hiện tại: {oldMainImages.length + selectedMainFiles.length}/7
            </small>
          </div>

          <div className={styles['descriptions-area']}>
            <h3>Phần mô tả chi tiết</h3>
            {descriptions.map((desc, index) => (
              <div key={index} className={styles['desc-box']}>
                <input
                  placeholder="Tiêu đề mô tả (ví dụ: Chất liệu, Kích thước...)"
                  value={desc.title}
                  onChange={(e) =>
                    handleDescChange(index, 'title', e.target.value)
                  }
                />
                <textarea
                  placeholder="Nội dung mô tả…"
                  value={desc.content}
                  onChange={(e) =>
                    handleDescChange(index, 'content', e.target.value)
                  }
                />

                <label>Ảnh minh họa cho mô tả (tối đa 2)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleDescFileChange(index, e)}
                />

                <div className={styles['preview-images']}>
                  {/* Ảnh cũ mô tả */}
                  {desc.oldImages.map((img, imgIndex) => (
                    <div key={`old-desc-${index}-${imgIndex}`} className={styles['preview-item']}>
                      <img src={`http://localhost:3000${img}`} alt="Ảnh cũ mô tả" width="80" />
                      <button
                        type="button"
                        className={styles['btn-remove-circle']}
                        onClick={() => removeOldDescImage(index, imgIndex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Ảnh mới mô tả */}
                  {desc.selectedFiles.map((file, fileIndex) => (
                    <div key={`new-desc-${index}-${fileIndex}`} className={styles['preview-item']}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Ảnh mới mô tả"
                        width="80"
                      />
                      <button
                        type="button"
                        className={styles['btn-remove-circle']}
                        onClick={() => removeNewDescFile(index, fileIndex)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <small>
                  Tổng ảnh cho mô tả này: {desc.oldImages.length + desc.selectedFiles.length}/2
                </small>
              </div>
            ))}
            <button
              type="button"
              className={styles['btn-add-desc']}
              onClick={addDescription}
            >
              + Thêm mô tả
            </button>
          </div>

          <div className={styles['status-toggle']}>
            <label>Trạng thái hiển thị (Hiện / Ẩn với khách hàng):</label>
            <input
              type="checkbox"
              name="status"
              checked={productData.status}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles['form-footer']}>
            <button type="submit" className={styles['btn-save']} disabled={loading}>
              {loading
                ? 'Đang lưu...'
                : isEdit
                ? 'Cập nhật sản phẩm'
                : 'Thêm sản phẩm'}
            </button>
            <button
              type="button"
              className={styles['btn-cancel']}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;