import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import styles from '../../css/admin-products.module.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('category');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Category form state
  const [catInput, setCatInput] = useState('');
  const [editingCat, setEditingCat] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catRes = await axios.get('http://localhost:3000/api/categories');
      const prodRes = await axios.get('http://localhost:3000/api/products');

      setCategories(catRes.data);
      setProducts(prodRes.data.products || []);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const endpoint =
        activeTab === 'category'
          ? `http://localhost:3000/api/categories/delete/${itemToDelete._id}`
          : `http://localhost:3000/api/products/${itemToDelete._id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      alert('Xóa thành công!');
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi khi xóa: ' + (error.response?.data?.message || 'Không xác định'));
    }
  };

  const handleAddCat = async () => {
    if (!catInput.trim()) return;
    await axios.post('http://localhost:3000/api/categories/add', { name: catInput });
    setCatInput('');
    fetchData();
  };

  const handleUpdateCat = async () => {
    if (!editingCat || !catInput.trim()) return;
    await axios.put(`http://localhost:3000/api/categories/update/${editingCat._id}`, { name: catInput });
    setCatInput('');
    setEditingCat(null);
    fetchData();
  };

  // Pagination logic
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 3) * 3;
    return new Array(Math.min(3, totalPages - start)).fill().map((_, idx) => start + idx + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  return (
    <div className={styles['admin-products-page']}>
      {/* Tabs */}
      <div className={styles['tab-navigation']}>
        <button
          className={`${styles.tab} ${activeTab === 'category' ? styles.active : ''}`}
          onClick={() => setActiveTab('category')}
        >
          Loại sản phẩm
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'product' ? styles.active : ''}`}
          onClick={() => setActiveTab('product')}
        >
          Sản phẩm
        </button>
      </div>

      <hr />

      <div className={styles['products-content']}>
        {activeTab === 'category' ? (
          <section className={styles['category-section']}>
            <h1 style={{ color: '#000856' }}>Quản lý các loại sản phẩm</h1>

            <div className={styles['summary-header']}>
              <h2>Tổng quan</h2>
              <span className={`${styles.badge} ${styles['badge-green']}`}>
                Số lượng loại: {categories.length}
              </span>
            </div>

            <div className={styles['category-container']}>
              <div className={styles['category-list']}>
                <h2>Danh sách loại sản phẩm</h2>
                <hr />
                <table className={styles['striped-table']}>
                  <thead>
                    <tr className={styles['table-header-category']}>
                      <th>STT</th>
                      <th className={styles['category-name']}>Tên loại sản phẩm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, index) => (
                      <tr
                        key={cat._id}
                        className={index % 2 === 0 ? styles.even : styles.odd}
                        onClick={() => {
                          setEditingCat(cat);
                          setCatInput(cat.name);
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>{cat.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles['category-actions']}>
                <h2>Thao tác</h2>
                <hr />
                <label>Nhập vào tên loại</label>
                <input
                  className={styles['cat-input']}
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  placeholder="Nhập tên loại sản phẩm ..."
                />

                <div className={styles['btn-group']}>
                  <button className={styles['btn-add-category']} onClick={handleAddCat}>
                    Thêm loại sản phẩm
                  </button>
                  <button
                    className={styles['btn-edit-category']}
                    onClick={handleUpdateCat}
                    disabled={!editingCat}
                  >
                    Cập nhật loại sản phẩm
                  </button>
                  <button
                    className={styles['btn-delete-category']}
                    onClick={() => confirmDelete(editingCat)}
                    disabled={!editingCat}
                  >
                    Xóa loại sản phẩm
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className={styles['product-section']}>
            <h1>Quản lý các sản phẩm</h1>

            <div className={styles['summary-header']}>
              <h2>Tổng quan</h2>
              <span className={`${styles.badge} ${styles['badge-blue']}`}>
                Số lượng sản phẩm: {products.length}
              </span>
            </div>

            <div className={styles['product-tools']}>
              <div className={styles['search-box']}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className={styles['search-icon']} />
              </div>
              <button
                className={styles['btn-add-large']}
                onClick={() => navigate('/admin/products/add')}
              >
                <FaPlus /> Thêm sản phẩm
              </button>
            </div>

            <table className={styles['product-table-items']}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Loại sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Ảnh sản phẩm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((prod, index) => (
                  <tr key={prod._id} onClick={() => navigate(`/admin/products/${prod._id}`)}>
                    <td>{indexOfFirstProduct + index + 1}</td>
                    <td>{prod.name}</td>
                    <td>{prod.category?.name || '—'}</td>
                    <td>{prod.stock}</td>
                    <td className={prod.stock > 0 ? styles['in-stock'] : styles['out-of-stock']}>
                      {prod.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </td>
                    <td>
                      <img
                        src={
                          prod.images && prod.images.length > 0
                            ? `http://localhost:3000${prod.images[0]}`
                            : '/placeholder-img.jpg'
                        }
                        alt={prod.name}
                        className={styles['product-img-preview']}
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles['btn-yellow']}
                        onClick={() => navigate(`/admin/products/edit/${prod._id}`)}
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button className={styles['btn-red']} onClick={() => confirmDelete(prod)}>
                        <FaTrash /> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <FaChevronLeft />
                </button>

                {getPaginationGroup().map((item) => (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={currentPage === item ? styles.active : ''}
                  >
                    {item}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <FaExclamationTriangle size={50} color="#ff4d4f" />
            <h3>Thông báo</h3>
            <p>
              Bạn có chắc chắn muốn xóa {activeTab === 'category' ? 'loại sản phẩm' : 'sản phẩm'}{' '}
              này không?
            </p>
            <div className={styles['modal-btns']}>
              <button className={styles['btn-confirm']} onClick={handleDelete}>
                Xác nhận
              </button>
              <button className={styles['btn-cancel']} onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;