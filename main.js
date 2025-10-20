// ====================== CLASS PRODUCT ====================== //
class Product {
  constructor(id, name, price, image, category, hot, description) {
    Object.assign(this, { id, name, price, image, category, hot, description });
  }

  render() {
    return `
      <div class="product">
        <div class="product-img">
          ${this.hot ? '<div class="sticker-hot">HOT</div>' : ''}
          <a href="detail.html?id=${this.id}">
            <img src="${this.image}" alt="${this.name}" 
                 onerror="this.onerror=null;this.src='img/default.jpg';" />
          </a>
        </div>
        <div class="product-info">
          <h4>${this.name}</h4>
          <p class="price">${Number(this.price).toLocaleString()}₫</p>
          <button class="buy-btn" data-id="${this.id}">🛒 Mua ngay</button>
        </div>
      </div>`;
  }

  renderDetail() {
    return `
      <div class="product-detail">
        <div class="product-detail-image">
          <img src="${this.image}" alt="${this.name}" 
               onerror="this.onerror=null;this.src='img/default.jpg';" />
        </div>
        <div class="product-detail-info">
          <h1>${this.name}</h1>
          <p>Giá: ${Number(this.price).toLocaleString()}₫</p>
          <p>Danh mục: ${this.category}</p>
          <p>${this.description || 'Không có mô tả.'}</p>
          <button class="buy-btn" data-id="${this.id}">🛒 Thêm vào giỏ hàng</button>
        </div>
      </div>`;
  }
}

// ====================== CLASS CART ====================== //
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }
  save() { localStorage.setItem('cart', JSON.stringify(this.items)); }
  addItem(product) {
    const exist = this.items.find(i => i.id === product.id);
    if (exist) exist.quantity++;
    else this.items.push({ ...product, quantity: 1 });
    this.save();
    this.render();
  }
  update(id, qty) {
    const i = this.items.find(x => x.id === id);
    if (i) i.quantity = Math.max(1, qty);
    this.save();
    this.render();
  }
  remove(id) {
  this.items = this.items.filter(i => Number(i.id) !== Number(id));
  this.save();
  this.render();
}

  clear() {
    this.items = [];
    this.save();
    this.render();
  }
  total() {
    return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  render() {
    const panel = document.getElementById('cart-panel');
    if (!panel) return;
    if (!this.items.length) {
      panel.innerHTML = `
        <div class="cart-content">
          <h2>🛒 Giỏ hàng</h2>
          <p style="text-align:center;color:red;">Trống!</p>
          <button id="closeCart" class="close-cart">Đóng</button>
        </div>`;
      document.getElementById('closeCart').onclick = () => panel.classList.remove('active');
      return;
    }

    panel.innerHTML = `
      <div class="cart-content">
        <h2>🛒 Giỏ hàng</h2>
        <table class="cart-table">
          <thead>
            <tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>SL</th><th>Tổng</th><th>Xóa</th></tr>
          </thead>
          <tbody>
            ${this.items.map(i => `
              <tr>
                <td><img src="${i.image}" width="60"></td>
                <td>${i.name}</td>
                <td>${i.price.toLocaleString()}₫</td>
                <td><input type="number" min="1" value="${i.quantity}" data-id="${i.id}" class="qty-input"></td>
                <td>${(i.price * i.quantity).toLocaleString()}₫</td>
              <td><button class="remove-btn" data-id="${i.id}">✖</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="cart-total">
          <h3>Tổng: ${this.total().toLocaleString()}₫</h3>
          <button id="clearCartBtn" class="clear-cart">Xóa toàn bộ</button>
          <button id="closeCart" class="close-cart">Đóng</button>
        </div>
      </div>`;

    document.getElementById('closeCart').onclick = () => panel.classList.remove('active');
    document.getElementById('clearCartBtn').onclick = () => { if (confirm('Xóa toàn bộ?')) this.clear(); };
    document.querySelectorAll('.remove-btn').forEach(b => b.onclick = e => this.remove(Number(e.target.dataset.id)));
    document.querySelectorAll('.qty-input').forEach(inp => inp.onchange = e => this.update(Number(e.target.dataset.id), +e.target.value));
  }
}
const cart = new Cart();

// ====================== HÀM CHUNG ====================== //
const renderList = (arr, el) => {
  el.innerHTML = arr.map(i => new Product(
    i.id, i.name, i.price, i.image, i.category, i.hot, i.description
  ).render()).join('');
};
const fetchProducts = () => fetch('https://my-json-server.typicode.com/dangducnhatkhoa/dev1/products/').then(r => r.json());

// ====================== HEADER & FOOTER ====================== //
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', `
    <header>
      <div class="navbar">
        <div class="logo"><a href="index.html">My Shop</a></div>
        <div class="menu">
          <a href="index.html">Trang chủ</a>
          <a href="product.html">Sản phẩm</a>
          <a href="admin.html">Admin</a>
          <a href="gioithieu.html">Giới thiệu</a>
          <a href="lienhe.html">Liên hệ</a>
          <a href="#" id="cartIcon"><i class="fa fa-shopping-cart"></i> Giỏ hàng (<span id="cart-count">${cart.items.length}</span>)</a>
        </div>
      </div>
    </header>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer><p>© 2025 - Website bán hàng demo</p></footer>
    <div id="cart-panel" class="cart-panel"></div>`);

  // Mở popup giỏ hàng
  document.addEventListener('click', e => {
    if (e.target.closest('#cartIcon')) {
      e.preventDefault();
      document.getElementById('cart-panel').classList.add('active');
      cart.render();
    }
  });
});

// ====================== HIỂN THỊ SẢN PHẨM ====================== //
document.addEventListener('DOMContentLoaded', () => {
  const hot = document.getElementById('product-hot');
  const laptop = document.getElementById('product-laptop');
  const phone = document.getElementById('product-dienthoai');
  const all = document.getElementById('all-product');
  const detail = document.getElementById('detail-product');

  if (hot || laptop || phone) {
    fetchProducts().then(data => {
      if (hot) renderList(data.filter(p => p.hot), hot);
      if (laptop) renderList(data.filter(p => p.category === 'laptop'), laptop);
      if (phone) renderList(data.filter(p => p.category === 'điện thoại'), phone);
    });
  }

  if (all) {
    fetchProducts().then(data => {
      renderList(data, all);
      const search = document.getElementById('searchInput');
      const sort = document.getElementById('sort-price');
      search && search.addEventListener('input', () => {
        renderList(data.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase())), all);
      });
      sort && sort.addEventListener('change', () => {
        let sorted = [...data];
        if (sort.value === 'asc') sorted.sort((a, b) => a.price - b.price);
        if (sort.value === 'desc') sorted.sort((a, b) => b.price - a.price);
        renderList(sorted, all);
      });
    });
  }

  if (detail) {
    const id = new URLSearchParams(location.search).get('id');
    if (id) {
      fetch(`https://my-json-server.typicode.com/dangducnhatkhoa/dev1/products/${id}`)
        .then(r => r.json())
        .then(d => detail.innerHTML = new Product(
          d.id, d.name, d.price, d.image, d.category, d.hot, d.description
        ).renderDetail())
        .catch(err => {
          console.error('Lỗi fetch detail:', err);
          detail.innerHTML = `<p style="color:red;text-align:center;">Lỗi tải sản phẩm! Vui lòng kiểm tra server hoặc thử lại.</p>`;
        });
    } else {
      detail.innerHTML = `<p style="color:red;text-align:center;">Không tìm thấy sản phẩm!</p>`;
    }
  }
});

// ====================== NÚT MUA HÀNG ====================== //
document.addEventListener('click', e => {
  if (e.target.classList.contains('buy-btn')) {
    const id = Number(e.target.dataset.id); // Fix: Convert sang Number để match db id
    if (!id) return; // Fix: Check id tồn tại
    fetch(`https://my-json-server.typicode.com/dangducnhatkhoa/dev1/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Product not found');
        return r.json();
      })
      .then(p => {
        if (!p || !p.name) throw new Error('Invalid product');
        cart.addItem(p);
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) cartCountEl.textContent = cart.items.length; // Fix: Check element tồn tại trước khi update
        alert(`✅ Đã thêm "${p.name}" vào giỏ hàng!`);
      })
      .catch(err => {
        console.error('Lỗi add to cart:', err);
        alert('❌ Lỗi khi thêm vào giỏ hàng. Vui lòng kiểm tra server.');
      });
  }
});