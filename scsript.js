function hashPassword(password) {
    return Array.from(new Uint8Array(
      crypto.subtle.digestSync('SHA-256', new TextEncoder().encode(password))
    )).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  const state = {
    userRole: localStorage.getItem('userRole') || 'guest',
    userData: JSON.parse(localStorage.getItem('userData')) || null,
    users: JSON.parse(localStorage.getItem('users')) || [],
    products: [
      {
        id: 1,
        name: "Laptop Dell Inspiron 15",
        price: 15000000,
        category: "laptop",
        image: "https://www.laptopvip.vn/images/companies/1/JVS/DELL/Dell-Inspiron/Dell-Inspiron-3511/in3511nt_cnb_00060lb055_bk.jpg?1686718638415",
        warranty: "12 tháng",
        description: "CPU: Intel Core i5, RAM: 8GB, SSD: 512GB, Màn hình: 15.6 inch Full HD",
      },
      {
        id: 2,
        name: "PC Gaming Ryzen 7",
        price: 30000000,
        category: "pc",
        image: "https://product.hstatic.net/1000288298/product/11978_dsc01495_d91845fd1a7848d98b0912cbc3cfeada_master.jpg",
        warranty: "36 tháng",
        description: "CPU: AMD Ryzen 7, GPU: RTX 3060, RAM: 16GB, SSD: 1TB",
      },
    ],
    cart: [],
    currentProduct: null,
    chatUser: null,
    orders: JSON.parse(localStorage.getItem('orders')) || [],
    modalTimeout: null
  };
  
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  const showModal = (modalId) => {
    const modal = $(`#${modalId}`);
    if (modal) {
      modal.classList.remove('hidden');
      if (modalId === 'login-modal') {
        startModalTimeout();
      }
    } else {
      console.error(`Modal #${modalId} not found`);
    }
  };
  const hideModal = (modalId) => {
    const modal = $(`#${modalId}`);
    if (modal) {
      modal.classList.add('hidden');
      if (modalId === 'login-modal') {
        clearModalTimeout();
      }
    } else {
      console.error(`Modal #${modalId} not found`);
    }
  };
  const setText = (selector, text) => {
    const element = $(selector);
    if (element) element.textContent = text;
  };
  const setValue = (selector, value) => {
    const element = $(selector);
    if (element) element.value = value;
  };
  const getValue = (selector) => {
    const element = $(selector);
    return element ? element.value.trim() : '';
  };
  const showToast = (message, type = 'success') => {
    if (typeof Toastify === 'undefined') {
      console.error('Toastify library not loaded. Falling back to alert.');
      alert(message);
      return;
    }
    Toastify({
      text: message,
      duration: 5000,
      gravity: 'top',
      position: 'right',
      backgroundColor: type === 'success' ? '#10B981' : '#EF4444',
    }).showToast();
  };
  
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function closeModalOnOutsideClick(event) {
    if (event.target.id === 'login-modal') {
      closeLoginModal();
    }
  }
  
  function startModalTimeout() {
    clearModalTimeout();
    state.modalTimeout = setTimeout(() => {
      if (!$('#login-modal')?.classList.contains('hidden')) {
        closeLoginModal();
        showToast('Modal đăng nhập đã tự động đóng do không hoạt động.', 'info');
      }
    }, 30000);
  }
  
  function clearModalTimeout() {
    if (state.modalTimeout) {
      clearTimeout(state.modalTimeout);
      state.modalTimeout = null;
    }
  }
  
  function resetModalTimeout() {
    if (!$('#login-modal')?.classList.contains('hidden')) {
      startModalTimeout();
    }
  }
  
  function showLoginModal() {
    showModal('login-modal');
    switchToLogin();
    validateLoginForm();
  }
  
  function closeLoginModal() {
    hideModal('login-modal');
    resetLoginForm();
    resetRegisterForm();
  }
  
  function switchToRegister() {
    const loginForm = $('#login-form');
    const registerForm = $('#register-form');
    if (loginForm && registerForm) {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      setText('#modal-title', 'Tạo tài khoản');
      resetLoginForm();
      validateRegisterForm();
    }
  }
  
  function switchToLogin() {
    const loginForm = $('#login-form');
    const registerForm = $('#register-form');
    if (loginForm && registerForm) {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      setText('#modal-title', 'Đăng nhập');
      resetRegisterForm();
      validateLoginForm();
    }
  }
  
  function togglePasswordVisibility(inputId, toggleId) {
    const input = $(`#${inputId}`);
    const toggle = $(`#${toggleId}`);
    if (input && toggle) {
      if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        `;
      } else {
        input.type = 'password';
        toggle.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        `;
      }
    }
  }
  
  function validateLoginEmail() {
    const email = getValue('#login-email');
    const error = $('#login-email-error');
    if (!email) {
      error.textContent = 'Vui lòng nhập email!';
      error.classList.remove('hidden');
      return false;
    }
    if (!isValidEmail(email)) {
      error.textContent = 'Email không hợp lệ!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateLoginPassword() {
    const password = getValue('#login-password');
    const error = $('#login-password-error');
    if (!password) {
      error.textContent = 'Vui lòng nhập mật khẩu!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateLoginForm() {
    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();
    const submitBtn = $('#login-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = !(isEmailValid && isPasswordValid);
    }
  }
  
  function validateRegisterName() {
    const name = getValue('#register-name');
    const error = $('#register-name-error');
    if (!name) {
      error.textContent = 'Vui lòng nhập họ và tên!';
      error.classList.remove('hidden');
      return false;
    }
    if (name.length < 2) {
      error.textContent = 'Họ và tên phải có ít nhất 2 ký tự!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateRegisterEmail() {
    const email = getValue('#register-email');
    const error = $('#register-email-error');
    if (!email) {
      error.textContent = 'Vui lòng nhập email!';
      error.classList.remove('hidden');
      return false;
    }
    if (!isValidEmail(email)) {
      error.textContent = 'Email không hợp lệ!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateRegisterPhone() {
    const phone = getValue('#register-phone');
    const error = $('#register-phone-error');
    if (!phone) {
      error.textContent = 'Vui lòng nhập số điện thoại!';
      error.classList.remove('hidden');
      return false;
    }
    if (!isValidPhone(phone)) {
      error.textContent = 'Số điện thoại không hợp lệ!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateRegisterPassword() {
    const password = getValue('#register-password');
    const error = $('#register-password-error');
    if (!password) {
      error.textContent = 'Vui lòng nhập mật khẩu!';
      error.classList.remove('hidden');
      return false;
    }
    if (password.length < 6) {
      error.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateRegisterConfirmPassword() {
    const password = getValue('#register-password');
    const confirmPassword = getValue('#register-confirm-password');
    const error = $('#register-confirm-password-error');
    if (!confirmPassword) {
      error.textContent = 'Vui lòng xác nhận mật khẩu!';
      error.classList.remove('hidden');
      return false;
    }
    if (password !== confirmPassword) {
      error.textContent = 'Mật khẩu xác nhận không khớp!';
      error.classList.remove('hidden');
      return false;
    }
    error.classList.add('hidden');
    return true;
  }
  
  function validateRegisterForm() {
    const isValid = validateRegisterName() && validateRegisterEmail() && validateRegisterPhone() && validateRegisterPassword() && validateRegisterConfirmPassword();
    const submitBtn = $('#register-submit-btn');
    if (submitBtn) submitBtn.disabled = !isValid;
    return isValid;
  }
  
  function resetLoginForm() {
    setValue('#login-email', '');
    setValue('#login-password', '');
    const emailError = $('#login-email-error');
    const passwordError = $('#login-password-error');
    const submitBtn = $('#login-submit-btn');
    if (emailError) emailError.classList.add('hidden');
    if (passwordError) passwordError.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;
    const loginPassword = $('#login-password');
    if (loginPassword && loginPassword.type === 'text') {
      togglePasswordVisibility('login-password', 'login-password-toggle');
    }
    validateLoginForm();
  }
  
  function resetRegisterForm() {
    setValue('#register-name', '');
    setValue('#register-email', '');
    setValue('#register-phone', '');
    setValue('#register-password', '');
    setValue('#register-confirm-password', '');
    const errors = ['#register-name-error', '#register-email-error', '#register-phone-error', '#register-password-error', '#register-confirm-password-error'];
    errors.forEach(selector => {
      const error = $(selector);
      if (error) error.classList.add('hidden');
    });
    const success = $('#register-success');
    const formFields = $('#register-form-fields');
    const submitBtn = $('#register-submit-btn');
    const progress = $('#register-progress');
    if (success) success.classList.add('hidden');
    if (formFields) formFields.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    if (progress) progress.classList.add('hidden');
    const registerPassword = $('#register-password');
    const confirmPassword = $('#register-confirm-password');
    if (registerPassword && registerPassword.type === 'text') {
      togglePasswordVisibility('register-password', 'register-password-toggle');
    }
    if (confirmPassword && confirmPassword.type === 'text') {
      togglePasswordVisibility('register-confirm-password', 'register-confirm-password-toggle');
    }
    validateRegisterForm();
  }
  
  function showCheckoutModal() {
    showModal('checkout-modal');
    if (state.userData) setValue('#checkout-email', state.userData.email);
  }
  
  function closeCheckoutModal() {
    hideModal('checkout-modal');
  }
  
  function showProductDetailModal(productId) {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;
    state.currentProduct = product;
    const imgElement = $('#product-detail-image');
    if (imgElement) {
      imgElement.src = product.image;
      imgElement.onerror = () => {
        imgElement.src = 'https://via.placeholder.com/150';
      };
    }
    setText('#product-detail-name', product.name);
    setText('#product-detail-price', `${product.price.toLocaleString()} VNĐ`);
    setText('#product-detail-category', product.category);
    setText('#product-detail-warranty', product.warranty || 'Chưa có thông tin');
    setText('#product-detail-description', product.description || 'Chưa có thông tin');
    const addToCartBtn = $('#add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.disabled = state.userRole === 'guest';
      addToCartBtn.classList.toggle('opacity-50', state.userRole === 'guest');
      addToCartBtn.classList.toggle('cursor-not-allowed', state.userRole === 'guest');
    }
    showModal('product-detail-modal');
  }
  
  function placeOrder() {
    if (state.userRole === 'guest') {
      showToast("Vui lòng đăng nhập để đặt đơn hàng!", 'error');
      showLoginModal();
      return;
    }
    if (state.userData) setValue('#order-email', state.userData.email);
    showModal('place-order-modal');
  }
  
  function closePlaceOrderModal() {
    hideModal('place-order-modal');
  }
  
  function login() {
    const email = getValue('#login-email');
    const password = getValue('#login-password');
  
    console.log('Login Attempt:', { email, password });
  
    if (!validateLoginForm()) {
      showToast("Vui lòng kiểm tra lại thông tin đăng nhập!", 'error');
      return;
    }
  
    try {
      // Kiểm tra tài khoản Developer
      if (email === "phamthanhtri60020341@gmail.com" && password === "phamtri1403@") {
        console.log('Developer account detected');
        state.userRole = 'dev';
        state.userData = { email, name: "Developer" };
        localStorage.setItem('userRole', state.userRole);
        localStorage.setItem('userData', JSON.stringify(state.userData));
        updateUI();
        closeLoginModal();
        showToast("Đăng nhập thành công!");
        window.location.hash = '#home';
        console.log('Developer login successful:', state);
        return;
      }
  
      // Kiểm tra tài khoản người dùng thông thường
      const hashedPassword = hashPassword(password);
      const user = state.users.find((u) => u.email === email && u.password === hashedPassword);
      if (user) {
        state.userRole = 'user';
        state.userData = { email: user.email, name: user.name, phone: user.phone };
        localStorage.setItem('userRole', state.userRole);
        localStorage.setItem('userData', JSON.stringify(state.userData));
        updateUI();
        closeLoginModal();
        showToast("Đăng nhập thành công!");
        window.location.hash = '#home';
        console.log('User login successful:', state);
      } else {
        showToast("Email hoặc mật khẩu không đúng!", 'error');
        console.log('Login failed: Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast("Đã xảy ra lỗi khi đăng nhập!", 'error');
    }
  }
  
  function logout() {
    try {
      state.userRole = 'guest';
      state.userData = null;
      state.cart = [];
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      updateUI();
      displayCart();
      showToast("Đăng xuất thành công!");
      window.location.hash = '#home';
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      showToast("Đã xảy ra lỗi khi đăng xuất!", 'error');
    }
  }
  
  function updateUI() {
    const loginLink = $('#login-link');
    const logoutLink = $('#logout-link');
    const cartLink = $('#cart-link');
    const ordersLink = $('#orders-link');
    const manageLink = $('#manage-link');
    const cart = $('#cart');
    const manage = $('#manage');
    const orders = $('#orders');
  
    if (loginLink) loginLink.classList.toggle('hidden', state.userRole !== 'guest');
    if (logoutLink) logoutLink.classList.toggle('hidden', state.userRole === 'guest');
    if (cartLink) cartLink.classList.toggle('hidden', state.userRole === 'guest');
    if (ordersLink) ordersLink.classList.toggle('hidden', state.userRole === 'guest');
    if (manageLink) manageLink.classList.toggle('hidden', state.userRole !== 'dev');
    if (cart) cart.classList.toggle('hidden', state.userRole === 'guest');
    if (manage) manage.classList.toggle('hidden', state.userRole !== 'dev');
    if (orders) orders.classList.toggle('hidden', state.userRole === 'guest');
  
    displayProducts();
    displayCart();
    displayManageProducts();
    displayManageUsers();
    displayOrders();
  }
  
  function displayProducts(filteredProducts = state.products) {
    const productList = $('#product-list');
    if (productList) {
      productList.innerHTML = '';
      filteredProducts.forEach((product) => {
        productList.innerHTML += `
          <div class="bg-white p-4 rounded shadow cursor-pointer" onclick="showProductDetailModal(${product.id})">
            <div class="relative">
              <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover mb-4 rounded" loading="lazy" onerror="this.src='https://via.placeholder.com/150'; this.nextElementSibling.classList.add('hidden')">
              <div class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 hidden">Đang tải...</div>
            </div>
            <h3 class="text-xl font-bold">${product.name}</h3>
            <p class="text-lg text-gray-600">${product.price.toLocaleString()} VNĐ</p>
          </div>
        `;
      });
    }
  }
  
  function displayManageProducts() {
    if (state.userRole !== 'dev') return;
    const manageProducts = $('#manage-products');
    if (manageProducts) {
      manageProducts.innerHTML = '';
      state.products.forEach((product) => {
        manageProducts.innerHTML += `
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-100 p-4 rounded">
            <div>
              <h4 class="font-bold">${product.name}</h4>
              <p>Giá: ${product.price.toLocaleString()} VNĐ</p>
              <p>Loại: ${product.category}</p>
              <p>Bảo hành: ${product.warranty || 'Chưa có thông tin'}</p>
              <p>Mô tả: ${product.description || 'Chưa có thông tin'}</p>
              <p>Hình: <a href="${product.image}" target="_blank" class="text-blue-600">Xem</a></p>
            </div>
            <div class="mt-4 sm:mt-0 space-x-2">
              <button onclick="editProduct(${product.id})" class="bg-yellow-600 text-white py-1 px-2 rounded hover:bg-yellow-700">Sửa</button>
              <button onclick="deleteProduct(${product.id})" class="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700">Xóa</button>
            </div>
          </div>
        `;
      });
    }
  }
  
  function displayManageUsers() {
    if (state.userRole !== 'dev') return;
    const manageUsers = $('#manage-users');
    if (manageUsers) {
      manageUsers.innerHTML = '';
      state.users.forEach((user) => {
        manageUsers.innerHTML += `
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-100 p-4 rounded">
            <div>
              <h4 class="font-bold">${user.name}</h4>
              <p>Email: ${user.email}</p>
              <p>Số điện thoại: ${user.phone || 'Chưa có'}</p>
            </div>
            <div class="mt-4 sm:mt-0">
              <button onclick="deleteUser('${user.email}')" class="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700">Xóa</button>
            </div>
          </div>
        `;
      });
    }
  }
  
  function deleteUser(email) {
    if (state.userRole !== 'dev') {
      showToast("Chỉ Developer mới có quyền xóa người dùng!", 'error');
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa tài khoản ${email}?`)) {
      state.users = state.users.filter((u) => u.email !== email);
      localStorage.setItem('users', JSON.stringify(state.users));
      displayManageUsers();
      showToast(`Đã xóa tài khoản ${email}!`);
    }
  }
  
  function addProduct() {
    if (state.userRole !== 'dev') {
      showToast("Chỉ Developer mới có quyền thêm sản phẩm!", 'error');
      return;
    }
    const name = getValue('#add-name');
    const price = parseInt(getValue('#add-price'));
    const category = getValue('#add-category');
    const image = getValue('#add-image');
    const warranty = getValue('#add-warranty');
    const description = getValue('#add-description');
  
    if (!name || !price || !category || !image) {
      showToast("Vui lòng điền đầy đủ thông tin sản phẩm!", 'error');
      return;
    }
  
    const newProduct = {
      id: state.products.length ? Math.max(...state.products.map((p) => p.id)) + 1 : 1,
      name,
      price,
      category,
      image,
      warranty,
      description,
    };
  
    state.products.push(newProduct);
    displayProducts();
    displayManageProducts();
    clearAddForm();
  }
  
  function clearAddForm() {
    setValue('#add-name', '');
    setValue('#add-price', '');
    setValue('#add-category', 'laptop');
    setValue('#add-image', '');
    setValue('#add-warranty', '');
    setValue('#add-description', '');
  }
  
  function editProduct(id) {
    if (state.userRole !== 'dev') {
      showToast("Chỉ Developer mới có quyền sửa sản phẩm!", 'error');
      return;
    }
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
  
    const newName = prompt("Nhập tên mới:", product.name);
    const newPrice = parseInt(prompt("Nhập giá mới (VNĐ):", product.price));
    const newCategory = prompt("Nhập loại mới:", product.category);
    const newImage = prompt("Nhập URL hình ảnh mới:", product.image);
    const newWarranty = prompt("Nhập bảo hành mới:", product.warranty || '');
    const newDescription = prompt("Nhập mô tả mới:", product.description || '');
  
    if (newName && newPrice && newCategory && newImage) {
      product.name = newName;
      product.price = newPrice;
      product.category = newCategory;
      product.image = newImage;
      product.warranty = newWarranty;
      product.description = newDescription;
      displayProducts();
      displayManageProducts();
    } else {
      showToast("Vui lòng điền đầy đủ thông tin!", 'error');
    }
  }
  
  function deleteProduct(id) {
    if (state.userRole !== 'dev') {
      showToast("Chỉ Developer mới có quyền xóa sản phẩm!", 'error');
      return;
    }
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      state.products = state.products.filter((p) => p.id !== id);
      displayProducts();
      displayManageProducts();
    }
  }
  
  function filterProducts() {
    const searchInput = getValue('#search-input').toLowerCase();
    const priceFilter = getValue('#price-filter');
    const categoryFilter = getValue('#category-filter');
  
    let filteredProducts = state.products;
  
    if (searchInput) {
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchInput)
      );
    }
  
    if (priceFilter !== 'all') {
      filteredProducts = filteredProducts.filter((product) => {
        if (priceFilter === 'low') return product.price < 10000000;
        if (priceFilter === 'medium') return product.price >= 10000000 && product.price <= 20000000;
        if (priceFilter === 'high') return product.price > 20000000;
      });
    }
  
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter((product) => product.category === categoryFilter);
    }
  
    displayProducts(filteredProducts);
  }
  
  function addToCart(productId) {
    if (state.userRole === 'guest') {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", 'error');
      showLoginModal();
      return;
    }
    const product = state.products.find((p) => p.id === productId);
    const cartItem = state.cart.find((item) => item.id === productId);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }
    displayCart();
    showToast("Đã thêm vào giỏ hàng!");
  }
  
  function addToCartFromModal() {
    if (state.currentProduct) {
      addToCart(state.currentProduct.id);
    }
  }
  
  function displayCart() {
    if (state.userRole === 'guest') return;
    const cartItems = $('#cart-items');
    const cartTotal = $('#cart-total');
    if (cartItems && cartTotal) {
      cartItems.innerHTML = '';
      let total = 0;
      state.cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItems.innerHTML += `
          <div class="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h3 class="text-lg font-bold">${item.name}</h3>
              <p>Số lượng: <input type="number" min="1" max="100" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)" class="w-16 p-1 border rounded"></p>
              <p>${itemTotal.toLocaleString()} VNĐ</p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="bg-red-600 text-white py-1 px-2 rounded hover:bg-red-700">Xóa</button>
          </div>
        `;
      });
      setText('#cart-total', `${total.toLocaleString()} VNĐ`);
    }
  }
  
  function updateQuantity(productId, quantity) {
    const cartItem = state.cart.find((item) => item.id === productId);
    if (cartItem) {
      quantity = parseInt(quantity);
      if (quantity > 100) {
        showToast("Số lượng tối đa là 100!", 'error');
        quantity = 100;
      }
      cartItem.quantity = quantity;
      if (cartItem.quantity <= 0) {
        removeFromCart(productId);
      }
    }
    displayCart();
  }
  
  function removeFromCart(productId) {
    state.cart = state.cart.filter((item) => item.id !== productId);
    displayCart();
  }
  
  function checkout() {
    if (state.userRole === 'guest') {
      showToast("Vui lòng đăng nhập để thanh toán!", 'error');
      showLoginModal();
      return;
    }
    if (state.cart.length === 0) {
      showToast("Giỏ hàng trống!", 'error');
      return;
    }
    showCheckoutModal();
  }
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^[0-9]{10,11}$/.test(phone);
  
  function confirmCheckout() {
    const name = getValue('#checkout-name');
    const address = getValue('#checkout-address');
    const phone = getValue('#checkout-phone');
    const email = getValue('#checkout-email');
  
    if (!name || !address || !phone || !email) {
      showToast("Vui lòng điền đầy đủ thông tin giao hàng!", 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast("Email không hợp lệ!", 'error');
      return;
    }
    if (!isValidPhone(phone)) {
      showToast("Số điện thoại không hợp lệ!", 'error');
      return;
    }
  
    let total = 0;
    const orderDetails = state.cart.map((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      return `${item.name} (x${item.quantity}): ${itemTotal.toLocaleString()} VNĐ`;
    }).join('\n');
  
    const orderMessage = `Đơn hàng mới:\n\nThông tin giao hàng:\n- Họ tên: ${name}\n- Địa chỉ: ${address}\n- Số điện thoại: ${phone}\n- Email: ${email}\n\nChi tiết đơn hàng:\n${orderDetails}\n\nTổng cộng: ${total.toLocaleString()} VNĐ`;
  
    const confirmBtn = $('#confirm-checkout-btn');
    if (confirmBtn) {
      confirmBtn.setAttribute('disabled', 'true');
      confirmBtn.textContent = 'Đang gửi...';
    }
  
    emailjs.send("service_m9nl6ii", "template_ar1mhag", {
      name,
      contact: email,
      message: orderMessage,
      time: new Date().toLocaleTimeString(),
    }).then(() => {
      showToast("Đơn hàng đã được gửi! Vui lòng quét mã QR để thanh toán.");
      saveOrder({ message: orderMessage });
      state.cart = [];
      displayCart();
      displayOrders();
      closeCheckoutModal();
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.textContent = 'Xác nhận thanh toán';
      }
    }).catch((error) => {
      console.error("Error sending email:", error);
      showToast("Có lỗi khi gửi đơn hàng. Vui lòng thử lại!", 'error');
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.textContent = 'Xác nhận thanh toán';
      }
    });
  }
  
  function confirmPlaceOrder() {
    const name = getValue('#order-name');
    const phone = getValue('#order-phone');
    const email = getValue('#order-email');
    const address = getValue('#order-address');
    const note = getValue('#order-note');
    const quantity = parseInt(getValue('#order-quantity') || 1);
  
    if (!name || !phone || !email || !address) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc!", 'error');
      return;
    }
  
    const orderDetails = `
      Đơn hàng mới (Không thanh toán):
      
      Thông tin khách hàng:
      - Họ tên: ${name}
      - Số điện thoại: ${phone}
      - Email: ${email}
      - Địa chỉ: ${address}
      - Ghi chú: ${note || 'Không có'}
      
      Sản phẩm:
      - Tên: ${state.currentProduct.name}
      - Giá: ${state.currentProduct.price.toLocaleString()} VNĐ
      - Số lượng: ${quantity}
      - Tổng: ${(state.currentProduct.price * quantity).toLocaleString()} VNĐ
      - Loại: ${state.currentProduct.category}
      - Bảo hành: ${state.currentProduct.warranty || 'Chưa có thông tin'}
    `;
  
    const confirmBtn = $('#confirm-place-order-btn');
    if (confirmBtn) {
      confirmBtn.setAttribute('disabled', 'true');
      confirmBtn.textContent = 'Đang gửi...';
    }
  
    emailjs.send("service_m9nl6ii", "template_ar1mhag", {
      name,
      contact: email,
      message: orderDetails,
      time: new Date().toLocaleTimeString(),
    }).then(() => {
      showToast("Đơn hàng đã được gửi! Chúng tôi sẽ liên hệ với bạn sớm.");
      saveOrder({ message: orderDetails });
      displayOrders();
      closePlaceOrderModal();
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.textContent = 'Xác nhận đặt đơn';
      }
    }).catch((error) => {
      console.error("Error sending email:", error);
      showToast("Có lỗi khi gửi đơn hàng. Vui lòng thử lại!", 'error');
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.textContent = 'Xác nhận đặt đơn';
      }
    });
  }
  
  function saveOrder(orderDetails) {
    const order = {
      ...orderDetails,
      id: state.orders.length ? Math.max(...state.orders.map((o) => o.id)) + 1 : 1,
      time: new Date().toLocaleString(),
    };
    state.orders.push(order);
    localStorage.setItem('orders', JSON.stringify(state.orders));
  }
  
  function displayOrders() {
    if (state.userRole === 'guest') return;
    const orderItems = $('#order-items');
    if (orderItems) {
      orderItems.innerHTML = '';
      state.orders.forEach((order) => {
        orderItems.innerHTML += `
          <div class="bg-white p-4 rounded shadow">
            <p><strong>Đơn hàng #${order.id}</strong></p>
            <p><strong>Thời gian:</strong> ${order.time}</p>
            <p><strong>Chi tiết:</strong></p>
            <pre class="text-sm text-gray-600 whitespace-pre-wrap">${order.message}</pre>
          </div>
        `;
      });
    }
    const orders = $('#orders');
    if (orders) orders.classList.toggle('hidden', state.userRole === 'guest');
  }
  
  function toggleChat() {
    if (state.userRole === 'guest') {
      showToast("Vui lòng đăng nhập để sử dụng chức năng chat!", 'error');
      showLoginModal();
      return;
    }
    const chatBox = $('#chat-box');
    const chatToggle = $('#chat-toggle');
    if (chatBox && chatToggle) {
      chatBox.classList.toggle('hidden');
      chatToggle.classList.toggle('hidden');
    }
  }
  
  function startChat() {
    if (state.userRole === 'guest') {
      showToast("Vui lòng đăng nhập để bắt đầu chat!", 'error');
      showLoginModal();
      return;
    }
    const name = getValue('#chat-name');
    const contact = getValue('#chat-contact');
  
    if (!name || !contact) {
      showToast("Vui lòng điền tên và thông tin liên hệ!", 'error');
      return;
    }
  
    state.chatUser = { name, contact };
    const contactForm = $('#chat-contact-form');
    const messages = $('#chat-messages');
    const input = $('#chat-input');
    if (contactForm && messages && input) {
      contactForm.classList.add('hidden');
      messages.classList.remove('hidden');
      input.classList.remove('hidden');
    }
  
    const chatMessages = $('#chat-messages');
    if (chatMessages) {
      chatMessages.innerHTML += `
        <div class="bg-gray-100 p-2 rounded mb-2">
          <p><strong>TechShop Bot</strong>: Chào ${name}! Rất vui được hỗ trợ bạn. Bạn cần tư vấn gì?</p>
          <p class="text-xs text-gray-500">${new Date().toLocaleTimeString()}</p>
        </div>
      `;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  
  function sendMessage() {
    if (!state.chatUser) {
      showToast("Vui lòng nhập thông tin liên hệ trước!", 'error');
      return;
    }
  
    const message = getValue('#chat-message').toLowerCase();
    if (!message) {
      showToast("Vui lòng nhập câu hỏi!", 'error');
      return;
    }
  
    const chatMessages = $('#chat-messages');
    const time = new Date().toLocaleTimeString();
  
    if (chatMessages) {
      chatMessages.innerHTML += `
        <div class="bg-blue-100 p-2 rounded mb-2">
          <p><strong>${state.chatUser.name}</strong> (${state.chatUser.contact}): ${message}</p>
          <p class="text-xs text-gray-500">${time}</p>
        </div>
      `;
  
      const botResponse = getBotResponse(message);
      chatMessages.innerHTML += `
        <div class="bg-gray-100 p-2 rounded mb-2">
          <p><strong>TechShop Bot</strong>: ${botResponse}</p>
          <p class="text-xs text-gray-500">${time}</p>
        </div>
      `;
  
      emailjs.send("service_m9nl6ii", "template_ar1mhag", {
        name: state.chatUser.name,
        contact: state.chatUser.contact,
        message: message,
        time: time,
      }).then(() => {
        chatMessages.innerHTML += `
          <div class="bg-green-100 p-2 rounded mb-2">
            <p>Tin nhắn đã được gửi đến nhân viên hỗ trợ!</p>
            <p class="text-xs text-gray-500">${time}</p>
          </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }).catch((error) => {
        console.error("Error sending email:", error);
        showToast("Có lỗi khi gửi tin nhắn. Vui lòng thử lại!", 'error');
      });
  
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setValue('#chat-message', '');
    }
  }
  
  function getBotResponse(message) {
    const chatbotResponses = [
      {
        keywords: ['laptop', 'máy tính'],
        response: 'Chúng tôi có nhiều mẫu laptop và PC gaming. Bạn muốn tìm hiểu về sản phẩm nào cụ thể?'
      },
      {
        keywords: ['giá', 'bao nhiêu'],
        response: 'Vui lòng cho biết sản phẩm bạn quan tâm, tôi sẽ cung cấp thông tin giá cả!'
      },
      {
        keywords: ['bảo hành'],
        response: 'Tất cả sản phẩm tại TechShop đều có bảo hành chính hãng. Bạn muốn biết chi tiết bảo hành của sản phẩm nào?'
      }
    ];
    for (const rule of chatbotResponses) {
      if (rule.keywords.some((keyword) => message.includes(keyword))) {
        return rule.response;
      }
    }
    return "Xin lỗi, tôi chưa hiểu câu hỏi. Tin nhắn của bạn đã được gửi đến nhân viên hỗ trợ!";
  }
  
  function register() {
    const name = getValue('#register-name');
    const email = getValue('#register-email');
    const phone = getValue('#register-phone');
    const password = getValue('#register-password');
    const confirmPassword = getValue('#register-confirm-password');
  
    console.log('Register Attempt:', { name, email, phone, password, confirmPassword });
  
    if (!validateRegisterForm()) {
      showToast("Vui lòng kiểm tra lại thông tin đăng ký!", 'error');
      return;
    }
  
    if (state.users.find((u) => u.email === email)) {
      showToast("Email đã được sử dụng!", 'error');
      return;
    }
  
    const submitBtn = $('#register-submit-btn');
    const progress = $('#register-progress');
    const progressBar = progress?.querySelector('.bg-blue-600');
    if (submitBtn) submitBtn.disabled = true;
    if (submitBtn) submitBtn.textContent = 'Đang xử lý...';
    if (progress) progress.classList.remove('hidden');
  
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue += 20;
      if (progressBar) progressBar.style.width = `${progressValue}%`;
      if (progressValue >= 100) clearInterval(progressInterval);
    }, 300);
  
    const hashedPassword = hashPassword(password);
    const newUser = { email, password: hashedPassword, name, phone };
    state.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(state.users));
    state.userRole = 'user';
    state.userData = { email, name, phone };
    localStorage.setItem('userRole', state.userRole);
    localStorage.setItem('userData', JSON.stringify(state.userData));
  
    const welcomeMessage = `
      Chào mừng ${name} đến với TechShop!
      
      Tài khoản của bạn đã được tạo thành công.
      Email: ${email}
      Số điện thoại: ${phone}
      
      Bạn có thể mua sắm, đặt hàng, và sử dụng các tính năng độc quyền tại TechShop.
      Nếu cần hỗ trợ, vui lòng liên hệ:
      - Email: phamthanhtri60020341@gmail.com
      - Hotline: 0931254118
      
      Cảm ơn bạn đã chọn TechShop!
    `;
  
    const formFields = $('#register-form-fields');
    const success = $('#register-success');
    if (formFields) formFields.classList.add('hidden');
    if (success) {
      success.classList.remove('hidden');
      setText('#register-success', `Tạo tài khoản thành công! Chào mừng ${name} đến với TechShop.`);
    }
  
    emailjs.send("service_m9nl6ii", "template_ar1mhag", {
      name: name,
      contact: email,
      message: welcomeMessage,
      time: new Date().toLocaleTimeString(),
    }).then(() => {
      showToast("Tạo tài khoản thành công!");
      updateUI();
      setTimeout(() => {
        closeLoginModal();
        window.location.hash = '#home';
      }, 2000);
    }).catch((error) => {
      console.error("Error sending email:", error);
      showToast("Tạo tài khoản thành công, nhưng lỗi khi gửi email xác nhận!", 'error');
      updateUI();
      setTimeout(() => {
        closeLoginModal();
        window.location.hash = '#home';
      }, 2000);
    }).finally(() => {
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtn) submitBtn.textContent = 'Tạo tài khoản';
      if (progress) progress.classList.add('hidden');
      if (progressBar) progressBar.style.width = '0%';
    });
  }
  
  function handleGoogleSignIn(response) {
    const userData = JSON.parse(atob(response.credential.split('.')[1]));
    const { email, name } = userData;
  
    console.log('Google Sign-In:', { email, name });
  
    if (state.users.find((u) => u.email === email)) {
      state.userRole = 'user';
      const user = state.users.find((u) => u.email === email);
      state.userData = { email, name: user.name || name, phone: user.phone || '' };
      localStorage.setItem('userRole', state.userRole);
      localStorage.setItem('userData', JSON.stringify(state.userData));
      updateUI();
      closeLoginModal();
      showToast("Đăng nhập thành công!");
      window.location.hash = '#home';
      return;
    }
  
    const newUser = {
      email,
      password: '',
      name: name || 'Google User',
      phone: ''
    };
    state.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(state.users));
    state.userRole = 'user';
    state.userData = { email, name: name || 'Google User', phone: '' };
    localStorage.setItem('userRole', state.userRole);
    localStorage.setItem('userData', JSON.stringify(state.userData));
  
    const welcomeMessage = `
      Chào mừng ${name} đến với TechShop!
      
      Tài khoản của bạn đã được tạo thông qua Google Sign-In.
      Email: ${email}
      
      Bạn có thể mua sắm, đặt hàng, và sử dụng các tính năng độc quyền tại TechShop.
      Nếu cần hỗ trợ, vui lòng liên hệ:
      - Email: phamthanhtri60020341@gmail.com
      - Hotline: 0931254118
      
      Cảm ơn bạn đã chọn TechShop!
    `;
  
    emailjs.send("service_m9nl6ii", "template_ar1mhag", {
      name: name || 'Google User',
      contact: email,
      message: welcomeMessage,
      time: new Date().toLocaleTimeString(),
    }).then(() => {
      showToast("Tạo tài khoản thành công với Google!");
      updateUI();
      closeLoginModal();
      window.location.hash = '#home';
    }).catch((error) => {
      console.error("Error sending email:", error);
      showToast("Tạo tài khoản thành công với Google, nhưng lỗi khi gửi email xác nhận!", 'error');
      updateUI();
      closeLoginModal();
      window.location.hash = '#home';
    });
  }
  
  function init() {
    updateUI();
    const searchInput = $('#search-input');
    const priceFilter = $('#price-filter');
    const categoryFilter = $('#category-filter');
    const loginEmail = $('#login-email');
    const loginPassword = $('#login-password');
    const registerName = $('#register-name');
    const registerEmail = $('#register-email');
    const registerPhone = $('#register-phone');
    const registerPassword = $('#register-password');
    const registerConfirmPassword = $('#register-confirm-password');
  
    if (searchInput) searchInput.addEventListener('input', debounce(filterProducts, 300));
    if (priceFilter) priceFilter.addEventListener('change', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
    if (loginEmail) loginEmail.addEventListener('input', validateLoginForm);
    if (loginPassword) loginPassword.addEventListener('input', validateLoginForm);
    if (registerName) registerName.addEventListener('input', validateRegisterForm);
    if (registerEmail) registerEmail.addEventListener('input', validateRegisterForm);
    if (registerPhone) registerPhone.addEventListener('input', validateRegisterForm);
    if (registerPassword) registerPassword.addEventListener('input', validateRegisterForm);
    if (registerConfirmPassword) registerConfirmPassword.addEventListener('input', validateRegisterForm);
  
    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, resetModalTimeout, { passive: true });
    });
  }
  
  window.handleGoogleSignIn = handleGoogleSignIn;
  
  document.addEventListener('DOMContentLoaded', init);