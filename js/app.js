document.addEventListener('DOMContentLoaded', () => {
  console.log("%c[SYSTEM BOOT] Vectorheart V.2 // SISTEMA ESTABLE.", "color: #E60000; font-family: monospace; font-size: 14px; font-weight: bold;");

  // --- 1. CURSOR ---
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = '<div id="cursor-coords">X:0 Y:0</div>';
  document.body.appendChild(cursor);
  const coords = document.getElementById('cursor-coords');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    coords.textContent = `X:${e.clientX} Y:${e.clientY}`;
  });

  function attachCursorHover(elements) {
    elements.forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5) rotate(45deg)';
        cursor.style.borderColor = 'var(--secondary)';
        cursor.style.borderRadius = '50%';
      });
      target.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
        cursor.style.borderColor = 'var(--primary)';
        cursor.style.borderRadius = '0';
      });
    });
  }
  attachCursorHover(document.querySelectorAll('a, button, [data-target="true"]'));

  // --- 2. MENÚ LATERAL ---
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const sideMenu = document.getElementById('sideMenu');
  menuBtn.addEventListener('click', () => sideMenu.classList.add('active'));
  closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('active'));

  // --- 3. BASE DE DATOS ---
  const artDatabase = [
    { id: "VH-001", title: "SYSTEM_OVERRIDE", price: 45.00, status: "ONLINE", image: "assets/img/obra1.jpg", artist: "Kael_X", exhibitions: "Cyber-Gallery 2025", rating: 5, desc: "Análisis espectral de frecuencias de neón." },
    { id: "VH-002", title: "Y2K_ARCHIVE_MIX", price: 60.00, status: "ONLINE", image: "assets/img/obra2.jpg", artist: "Vectorheart Collective", exhibitions: "Retro-Future Expo", rating: 4, desc: "Recopilación de interfaces gráficas y portadas." },
    { id: "VH-003", title: "BRAWLERS_WORLD", price: 35.00, status: "ONLINE", image: "assets/img/obra3.jpg", artist: "J.D. F.", exhibitions: "Archivo Interno", rating: 5, desc: "Cartografía abstracta y diseño low-poly." },
    { id: "VH-004", title: "FAITH_RUNNER", price: 55.00, status: "NUEVO", image: "assets/img/obra4.jpg", artist: "DICE_Inspire", exhibitions: "Underground Digital Fest", rating: 5, desc: "El rojo como guía. Experimento sobre el flujo." }
  ];

  // --- 4. MEMORIA LOCAL Y RENDERIZADO DEL PANEL DEL CARRITO ---
  let cart = JSON.parse(localStorage.getItem('vh_cart_items')) || [];
  const cartLink = document.querySelector('.cart-link');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalValue = document.getElementById('cartTotalValue');

  // Abrir/Cerrar panel de carrito
  cartLink.addEventListener('click', (e) => { e.preventDefault(); cartPanel.classList.add('active'); });
  closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));

  // Actualizar UI del carrito completo
  function updateCartUI() {
    cartLink.textContent = `CARRITO (${cart.length})`;
    localStorage.setItem('vh_cart_items', JSON.stringify(cart));

    // Dibujar los productos en el panel lateral
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="color:#666; font-family:monospace; margin-top:20px;">[ SISTEMA_VACÍO ]</p>';
    }

    cart.forEach((productId, index) => {
      const product = artDatabase.find(p => p.id === productId);
      if(product) {
        total += product.price;
        const itemHTML = `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="cart-item-info">
                        <h4>${product.title}</h4>
                        <p>$${product.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-item-btn" data-index="${index}" data-target="true">[ X ]</button>
                </div>
            `;
        cartItemsContainer.innerHTML += itemHTML;
      }
    });

    cartTotalValue.textContent = total.toFixed(2);
    attachRemoveLogic(); // Damos vida a los botones de borrar
  }

  // Lógica para borrar un ítem
  function attachRemoveLogic() {
    const removeBtns = document.querySelectorAll('.remove-item-btn');
    attachCursorHover(removeBtns);
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const itemIndex = btn.getAttribute('data-index');
        cart.splice(itemIndex, 1); // Borramos 1 elemento en ese índice
        updateCartUI(); // Volvemos a dibujar
      });
    });
  }

  // --- 5. RENDERIZADO DEL CATÁLOGO ---
  const catalogGrid = document.getElementById('catalog-grid');
  function renderCatalog() {
    catalogGrid.innerHTML = '';
    artDatabase.forEach(product => {
      const isNew = product.status === 'NUEVO' ? '<span style="color:white; font-family:var(--font-title); font-size: 2rem; position:absolute; top:10px; left:10px; background:var(--primary); padding:2px 8px; z-index:20;">[NEW]</span>' : '';
      const cardHTML = `
                <div class="product-card">
                    <div class="card-header"><span class="serial">#${product.id}</span><span class="status-dot"></span></div>
                    <div class="product-image modal-trigger" data-id="${product.id}" data-target="true">
                        <img src="${product.image}" alt="${product.title}" class="real-art-img">
                        ${isNew}
                        <div class="scan-overlay">INSPECCIONAR</div>
                    </div>
                    <div class="product-info">
                        <h3>${product.title}</h3><p class="price">$${product.price.toFixed(2)}</p>
                        <button class="add-btn" data-id="${product.id}" data-target="true">AÑADIR_AL_SISTEMA</button>
                    </div>
                </div>
            `;
      catalogGrid.innerHTML += cardHTML;
    });

    attachCartAddLogic();
    attachModalLogic();
  }

  // Lógica de los botones "AÑADIR AL SISTEMA"
  function attachCartAddLogic() {
    const addButtons = document.querySelectorAll('.add-btn');
    attachCursorHover(addButtons);
    addButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        cart.push(productId);
        updateCartUI();

        // Efecto visual y abrir panel
        const originalText = button.textContent;
        const card = button.closest('.product-card');
        button.textContent = '[ DATOS_GUARDADOS ]';
        button.style.backgroundColor = 'var(--secondary)';
        card.style.borderColor = 'var(--secondary)';

        cartPanel.classList.add('active'); // Abrimos el carrito para que vea su compra

        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = 'var(--dark)';
          card.style.borderColor = 'var(--dark)';
        }, 1000);
      });
    });
  }

  // --- 6. MODAL DE INSPECCIÓN ---
  const modal = document.getElementById('artModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  function attachModalLogic() {
    const triggers = document.querySelectorAll('.modal-trigger');
    attachCursorHover(triggers);

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const productId = trigger.getAttribute('data-id');
        const product = artDatabase.find(p => p.id === productId);

        if (product) {
          document.getElementById('modalTitle').textContent = product.title;
          document.getElementById('modalArtist').textContent = product.artist;
          document.getElementById('modalExhibitions').textContent = product.exhibitions;
          document.getElementById('modalDesc').textContent = product.desc;
          document.getElementById('modalImage').innerHTML = `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(20%) contrast(120%);">`;

          let starsHTML = '';
          for (let i = 1; i <= 5; i++) { starsHTML += i <= product.rating ? '★' : '☆'; }
          document.getElementById('modalRating').textContent = starsHTML;

          modal.classList.add('active');
        }
      });
    });
  }

  closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

  // --- INICIO DEL SISTEMA ---
  renderCatalog();
  updateCartUI();
});
