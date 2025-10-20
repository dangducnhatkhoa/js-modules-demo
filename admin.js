// ====================== CLASS PRODUCT ADMIN ====================== //
class ProductAdmin {
  constructor() {
    this.products = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.currentEditId = null;
    this.init();
  }

  // Khởi tạo
  init() {
    this.loadProducts();
    this.bindEvents();
    this.render();
  }

  // Load dữ liệu từ db.json
  async loadProducts() {
    try {
      // Thử load từ localStorage trước (để demo)
      const localData = localStorage.getItem('admin_products');
      if (localData) {
        this.products = JSON.parse(localData);
        this.render();
        return;
      }

      // Nếu không có trong localStorage, load từ db.json
      const response = await fetch('db.json');
      const data = await response.json();
      this.products = data.products || [];
      
      // Lưu vào localStorage để demo
      localStorage.setItem('admin_products', JSON.stringify(this.products));
      this.render();
    } catch (error) {
      console.error('Lỗi load dữ liệu:', error);
      this.products = [];
      this.showNotification('Không thể tải dữ liệu sản phẩm!', 'error');
    }
  }

  // Lưu dữ liệu vào db.json (simulate)
  async saveProducts() {
    try {
      // Trong thực tế, bạn sẽ gửi dữ liệu lên server
      // Ở đây chúng ta lưu vào localStorage để demo
      localStorage.setItem('admin_products', JSON.stringify(this.products));
      this.showNotification('Đã lưu dữ liệu thành công!', 'success');
    } catch (error) {
      console.error('Lỗi lưu dữ liệu:', error);
      this.showNotification('Lỗi khi lưu dữ liệu!', 'error');
    }
  }

  // Thêm sản phẩm mới
  addProduct(productData) {
    const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
    const newProduct = {
      id: newId,
      name: productData.name,
      price: parseInt(productData.price),
      image: productData.image,
      category: productData.category,
      hot: productData.hot === 'on' || productData.hot === true,
      description: productData.description || ''
    };
    
    this.products.push(newProduct);
    this.saveProducts();
    this.render();
    this.closeModal();
    this.showNotification('Thêm sản phẩm thành công!', 'success');
  }

  // Cập nhật sản phẩm
  updateProduct(id, productData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        name: productData.name,
        price: parseInt(productData.price),
        image: productData.image,
        category: productData.category,
        hot: productData.hot === 'on' || productData.hot === true,
        description: productData.description || ''
      };
      
      this.saveProducts();
      this.render();
      this.closeModal();
      this.showNotification('Cập nhật sản phẩm thành công!', 'success');
    }
  }

  // Xóa sản phẩm
  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
      this.render();
      this.closeDeleteModal();
      this.showNotification('Xóa sản phẩm thành công!', 'success');
    }
  }

  // Tìm kiếm sản phẩm
  searchProducts(query) {
    if (!query) return this.products;
    return this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Lọc theo danh mục
  filterByCategory(category) {
    if (!category) return this.products;
    return this.products.filter(product => product.category === category);
  }

  // Sắp xếp sản phẩm
  sortProducts(products, sortBy) {
    return products.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'id':
        default:
          return a.id - b.id;
      }
    });
  }

  // Render bảng sản phẩm
  render() {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'id';

    let filteredProducts = this.products;
    
    // Áp dụng bộ lọc
    if (searchQuery) {
      filteredProducts = this.searchProducts(searchQuery);
    }
    if (categoryFilter) {
      filteredProducts = this.filterByCategory(categoryFilter);
    }
    
    // Sắp xếp
    filteredProducts = this.sortProducts(filteredProducts, sortBy);

    // Phân trang
    const totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    this.renderTable(paginatedProducts);
    this.renderPagination(totalPages);
  }

  // Render bảng
  renderTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="no-data">
            <i class="fas fa-inbox"></i>
            <p>Không có sản phẩm nào</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.id}</td>
        <td class="product-image">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.src='img/default.jpg'">
        </td>
        <td class="product-name">${product.name}</td>
        <td class="product-price">${product.price.toLocaleString()}₫</td>
        <td class="product-category">
          <span class="category-badge category-${product.category}">
            ${product.category}
          </span>
        </td>
        <td class="product-hot">
          ${product.hot ? '<span class="hot-badge">HOT</span>' : '<span class="normal-badge">-</span>'}
        </td>
        <td class="product-description">${product.description || 'Không có mô tả'}</td>
        <td class="product-actions">
          <button class="btn btn-sm btn-primary edit-btn" data-id="${product.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Render phân trang
  renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '<div class="pagination-controls">';
    
    // Nút Previous
    if (this.currentPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="${this.currentPage - 1}">
        <i class="fas fa-chevron-left"></i>
      </button>`;
    }

    // Các trang
    for (let i = 1; i <= totalPages; i++) {
      if (i === this.currentPage) {
        paginationHTML += `<button class="pagination-btn active">${i}</button>`;
      } else {
        paginationHTML += `<button class="pagination-btn" data-page="${i}">${i}</button>`;
      }
    }

    // Nút Next
    if (this.currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn" data-page="${this.currentPage + 1}">
        <i class="fas fa-chevron-right"></i>
      </button>`;
    }

    paginationHTML += '</div>';
    pagination.innerHTML = paginationHTML;
  }

  // Bind events
  bindEvents() {
    // Nút thêm sản phẩm
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
      this.openModal();
    });

    // Nút export
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      this.exportData();
    });

    // Nút import
    document.getElementById('importBtn')?.addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    // Nút reset
    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.resetData();
    });

    // Xử lý file import
    document.getElementById('importFile')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importData(file);
        e.target.value = ''; // Reset input
      }
    });

    // Form submit
    document.getElementById('productForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Đóng modal
    document.getElementById('closeModal')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('cancelBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Đóng modal xóa
    document.getElementById('closeDeleteModal')?.addEventListener('click', () => {
      this.closeDeleteModal();
    });

    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
      this.closeDeleteModal();
    });

    // Xác nhận xóa
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
      if (this.currentEditId) {
        this.deleteProduct(this.currentEditId);
      }
    });

    // Tìm kiếm
    document.getElementById('searchInput')?.addEventListener('input', () => {
      this.currentPage = 1;
      this.render();
    });

    // Lọc danh mục
    document.getElementById('categoryFilter')?.addEventListener('change', () => {
      this.currentPage = 1;
      this.render();
    });

    // Sắp xếp
    document.getElementById('sortBy')?.addEventListener('change', () => {
      this.currentPage = 1;
      this.render();
    });

    // File upload handling
    document.getElementById('productImage')?.addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });

    // Drag and drop functionality
    const fileUploadLabel = document.querySelector('.file-upload-label');
    if (fileUploadLabel) {
      fileUploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadLabel.classList.add('drag-over');
      });

      fileUploadLabel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUploadLabel.classList.remove('drag-over');
      });

      fileUploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadLabel.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          document.getElementById('productImage').files = files;
          this.handleFileUpload({ target: { files: files } });
        }
      });
    }

    // Click outside modal để đóng
    document.getElementById('productModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'productModal') {
        this.closeModal();
      }
    });

    document.getElementById('deleteModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'deleteModal') {
        this.closeDeleteModal();
      }
    });

    // Event delegation cho các nút trong bảng
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn')) {
        const id = parseInt(e.target.closest('.edit-btn').dataset.id);
        this.editProduct(id);
      }
      
      if (e.target.closest('.delete-btn')) {
        const id = parseInt(e.target.closest('.delete-btn').dataset.id);
        this.confirmDelete(id);
      }

      if (e.target.closest('.pagination-btn')) {
        const page = parseInt(e.target.closest('.pagination-btn').dataset.page);
        if (page) {
          this.currentPage = page;
          this.render();
        }
      }
    });
  }

  // Mở modal
  openModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (product) {
      modalTitle.textContent = 'Chỉnh sửa sản phẩm';
      this.currentEditId = product.id;
      this.fillForm(product);
    } else {
      modalTitle.textContent = 'Thêm sản phẩm mới';
      this.currentEditId = null;
      this.resetForm();
    }
    
    modal.classList.add('active');
  }

  // Reset form về trạng thái ban đầu
  resetForm() {
    const form = document.getElementById('productForm');
    if (form) {
      form.reset();
    }
    
    // Reset file input
    const fileInput = document.getElementById('productImage');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Reset file upload label
    const fileUploadLabel = document.querySelector('.file-upload-label');
    if (fileUploadLabel) {
      fileUploadLabel.classList.remove('has-file');
      const textElement = fileUploadLabel.querySelector('.file-upload-text');
      if (textElement) {
        textElement.textContent = 'Chọn ảnh hoặc kéo thả vào đây';
      }
    }
    
    // Clear preview
    const preview = document.getElementById('imagePreview');
    if (preview) {
      preview.innerHTML = '';
    }
  }

  // Đóng modal
  closeModal() {
    document.getElementById('productModal').classList.remove('active');
    this.currentEditId = null;
  }

  // Mở modal xóa
  confirmDelete(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.currentEditId = id;
      document.getElementById('deleteProductInfo').innerHTML = `
        <div class="delete-product-preview">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h4>${product.name}</h4>
            <p>Giá: ${product.price.toLocaleString()}₫</p>
          </div>
        </div>
      `;
      document.getElementById('deleteModal').classList.add('active');
    }
  }

  // Đóng modal xóa
  closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    this.currentEditId = null;
  }

  // Chỉnh sửa sản phẩm
  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.openModal(product);
    }
  }

  // Điền form
  fillForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productHot').checked = product.hot;
    document.getElementById('productDescription').value = product.description || '';
    
    // Reset file input
    document.getElementById('productImage').value = '';
    const fileUploadLabel = document.querySelector('.file-upload-label');
    if (fileUploadLabel) {
      fileUploadLabel.classList.remove('has-file');
      fileUploadLabel.querySelector('.file-upload-text').textContent = 'Chọn ảnh hoặc kéo thả vào đây';
    }
    
    // Hiển thị ảnh hiện tại nếu có
    if (product.image) {
      this.showCurrentImage(product.image);
    } else {
      // Nếu không có ảnh, xóa preview
      const preview = document.getElementById('imagePreview');
      if (preview) {
        preview.innerHTML = '';
      }
    }
  }

  // Hiển thị ảnh hiện tại
  showCurrentImage(imageUrl) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = `
      <div class="image-preview-container">
        <img src="${imageUrl}" alt="Current Image" 
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
             onload="this.nextElementSibling.style.display='none';">
        <p style="display: none; color: #dc3545;">⚠️ Không thể tải ảnh</p>
        <p>Ảnh hiện tại</p>
        <small>Để thay đổi ảnh, hãy chọn file mới bên trên</small>
      </div>
    `;
  }

  // Xử lý submit form
  async handleFormSubmit() {
    const formData = new FormData(document.getElementById('productForm'));
    const fileInput = document.getElementById('productImage');
    
    // Lấy thông tin cơ bản
    const productData = {
      name: formData.get('name'),
      price: parseInt(formData.get('price')),
      category: formData.get('category'),
      hot: formData.get('hot') === 'on',
      description: formData.get('description') || ''
    };

    // Xử lý ảnh
    let imageUrl = '';
    
    // Nếu có file mới được chọn
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        this.showNotification('Vui lòng chọn file ảnh hợp lệ!', 'error');
        return;
      }

      // Kiểm tra kích thước file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showNotification('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.', 'error');
        return;
      }

      try {
        // Tạo URL từ file
        imageUrl = await this.createImageUrl(file);
      } catch (error) {
        console.error('Lỗi xử lý file:', error);
        this.showNotification('Lỗi khi xử lý ảnh!', 'error');
        return;
      }
    } else {
      // Nếu đang edit và không chọn file mới, giữ ảnh cũ
      if (this.currentEditId) {
        const existingProduct = this.products.find(p => p.id === this.currentEditId);
        if (existingProduct) {
          imageUrl = existingProduct.image;
        }
      } else {
        // Nếu thêm mới mà không có ảnh
        this.showNotification('Vui lòng chọn ảnh sản phẩm!', 'error');
        fileInput.focus();
        return;
      }
    }

    // Thêm ảnh vào productData
    productData.image = imageUrl;

    // Lưu sản phẩm
    if (this.currentEditId) {
      this.updateProduct(this.currentEditId, productData);
    } else {
      this.addProduct(productData);
    }
  }

  // Tạo URL từ file (trong thực tế sẽ upload lên server)
  createImageUrl(file) {
    // Trong demo, chúng ta sử dụng FileReader để tạo data URL
    // Trong thực tế, bạn sẽ upload file lên server và nhận về URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  // Xử lý file upload
  handleFileUpload(e) {
    const file = e.target.files[0];
    const fileUploadLabel = document.querySelector('.file-upload-label');
    
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        this.showNotification('Vui lòng chọn file ảnh!', 'error');
        e.target.value = '';
        return;
      }
      
      // Kiểm tra kích thước file (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.showNotification('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.', 'error');
        e.target.value = '';
        return;
      }
      
      // Cập nhật UI
      if (fileUploadLabel) {
        fileUploadLabel.classList.add('has-file');
        const textElement = fileUploadLabel.querySelector('.file-upload-text');
        if (textElement) {
          textElement.textContent = `Đã chọn: ${file.name}`;
        }
      }
      
      // Preview ảnh
      this.previewImageFromFile(file);
    } else {
      // Reset UI
      if (fileUploadLabel) {
        fileUploadLabel.classList.remove('has-file');
        const textElement = fileUploadLabel.querySelector('.file-upload-text');
        if (textElement) {
          textElement.textContent = 'Chọn ảnh hoặc kéo thả vào đây';
        }
      }
      
      const preview = document.getElementById('imagePreview');
      if (preview) {
        preview.innerHTML = '';
      }
    }
  }

  // Preview ảnh từ file
  previewImageFromFile(file) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      preview.innerHTML = `
        <div class="image-preview-container">
          <img src="${e.target.result}" alt="Preview" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
               onload="this.nextElementSibling.style.display='none';">
          <p style="display: none; color: #dc3545;">⚠️ Không thể hiển thị ảnh</p>
          <p>Xem trước ảnh ✅</p>
          <div class="file-info">
            <small>Tên: ${file.name}</small><br>
            <small>Kích thước: ${this.formatFileSize(file.size)}</small>
          </div>
        </div>
      `;
    };
    
    reader.onerror = () => {
      preview.innerHTML = `
        <div class="image-preview-container">
          <p style="color: #dc3545;">⚠️ Lỗi khi đọc file</p>
        </div>
      `;
    };
    
    reader.readAsDataURL(file);
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Hiển thị message cho field
  showFieldMessage(input, message, type) {
    // Xóa message cũ
    const existingMessage = input.parentNode.querySelector('.field-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Tạo message mới
    const messageEl = document.createElement('div');
    messageEl.className = `field-message field-message-${type}`;
    messageEl.textContent = message;
    input.parentNode.appendChild(messageEl);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 3000);
  }

  // Hiển thị thông báo
  showNotification(message, type = 'info') {
    // Xóa thông báo cũ nếu có
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Tạo thông báo
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;

    // Thêm vào body
    document.body.appendChild(notification);

    // Hiệu ứng xuất hiện
    setTimeout(() => notification.classList.add('show'), 100);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Export dữ liệu
  exportData() {
    const dataStr = JSON.stringify(this.products, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products_export.json';
    link.click();
    URL.revokeObjectURL(url);
    this.showNotification('Đã xuất dữ liệu thành công!', 'success');
  }

  // Import dữ liệu
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          this.products = data;
          this.saveProducts();
          this.render();
          this.showNotification('Import dữ liệu thành công!', 'success');
        } else {
          this.showNotification('File không đúng định dạng!', 'error');
        }
      } catch (error) {
        this.showNotification('Lỗi khi đọc file!', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Reset dữ liệu về ban đầu
  resetData() {
    if (confirm('Bạn có chắc chắn muốn reset dữ liệu về ban đầu? Hành động này không thể hoàn tác!')) {
      localStorage.removeItem('admin_products');
      this.loadProducts();
      this.showNotification('Đã reset dữ liệu!', 'success');
    }
  }
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductAdmin();
});
