/**
 * ==========================================================================
 * VECTORHEART // CEREBRO DEL SISTEMA (APP.JS)
 * V.3.0 - MARATHON EDITION
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mensaje oculto en la consola para los curiosos
  console.log("%c[SYSTEM BOOT] Vectorheart V.3 // TACTICAL_HUD_ACTIVE.", "color: #D4FF00; font-family: monospace; font-size: 14px; font-weight: bold; background: #000; padding: 5px;");

  /* ==========================================================================
     1. CURSOR UNIVERSAL CIBERNÉTICO
     ========================================================================== */
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = '<div id="cursor-coords">X:0 Y:0</div>';
  document.body.appendChild(cursor);
  const coords = document.getElementById('cursor-coords');

  // Mueve el cursor siguiendo el ratón
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    coords.textContent = `X:${e.clientX} Y:${e.clientY}`;
  });

  // Función para que el cursor cambie al pasar sobre botones/enlaces
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
  // Aplicamos el efecto hover a todos los elementos interactivos
  attachCursorHover(document.querySelectorAll('a, button, [data-target="true"]'));


  /* ==========================================================================
     2. MENÚ LATERAL (SIDEBAR)
     ========================================================================== */
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const tiendaLink = document.getElementById('tiendaLink');

  if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', () => sideMenu.classList.add('active'));
  }
  if (closeMenuBtn && sideMenu) {
    closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('active'));
  }
  if (tiendaLink && sideMenu) {
    tiendaLink.addEventListener('click', () => sideMenu.classList.remove('active'));
  }


  /* ==========================================================================
     3. BASE DE DATOS DE ARTE
     ========================================================================== */
  let artDatabase = [];


  /* ==========================================================================
     4. CARRITO DE COMPRAS Y ALMACENAMIENTO (LOCALSTORAGE)
     ========================================================================== */
  let cart = JSON.parse(localStorage.getItem('vh_cart_items')) || [];

  const cartLink = document.querySelector('.cart-link');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalValue = document.getElementById('cartTotalValue');

  function updateCartUI() {
    if (cartPanel && cartLink) {
      if (cartLink.textContent.includes('CARRITO') || cartLink.textContent.includes('0')) {
        cartLink.textContent = `CARRITO (${cart.length})`;
      }

      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
      cartItemsContainer.innerHTML = '';
      let total = 0;

      if(cart.length === 0) {
        // Texto limpio sin corchetes
        cartItemsContainer.innerHTML = '<p style="color:#666; font-family:var(--font-tech); margin-top:20px; text-transform:uppercase; letter-spacing: 1px;">SISTEMA VACÍO</p>';
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
                      <button class="remove-item-btn" data-index="${index}" data-target="true">X</button>
                  </div>
              `;
          cartItemsContainer.innerHTML += itemHTML;
        }
      });

      cartTotalValue.textContent = total.toFixed(2);
      attachRemoveLogic();
    } else {
      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
    }
  }

  function attachRemoveLogic() {
    const removeBtns = document.querySelectorAll('.remove-item-btn');
    attachCursorHover(removeBtns);
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const itemIndex = btn.getAttribute('data-index');
        cart.splice(itemIndex, 1);
        updateCartUI();
      });
    });
  }

  if (cartLink && cartPanel && closeCartBtn) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      cartPanel.classList.add('active');
    });
    closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));
  }

  const btnVaciar = document.getElementById('btn-vaciar-carrito');
  if (btnVaciar) {
    attachCursorHover([btnVaciar]);
    btnVaciar.addEventListener('click', () => {
      cart = [];
      updateCartUI();
    });
  }


  /* ==========================================================================
     5. RENDERIZADO DEL CATÁLOGO
     ========================================================================== */
  const catalogGrid = document.getElementById('catalog-grid');

  if (catalogGrid) {
    async function fetchArtCatalog() {
      try {
        // Mensaje de carga limpio
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-heading); font-size:2rem; grid-column: 1 / -1; text-align:center;">CONECTANDO CON SERVIDOR...</div>';

        const response = await fetch('./productos.json');

        if (!response.ok) throw new Error('Error en la conexión del servidor');

        artDatabase = await response.json();
        renderCatalog();
        updateCartUI();

      } catch (error) {
        console.error("Fallo de sistema:", error);
        // Error limpio
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-heading); font-size:2rem; grid-column: 1 / -1; text-align:center;">ERROR DE CONEXIÓN: CATÁLOGO CORRUPTO</div>';
      }
    }

    function renderCatalog() {
      catalogGrid.innerHTML = '';
      artDatabase.forEach(product => {
        // Etiqueta "NUEVO" adaptada al diseño sólido de Marathon
        const isNew = product.status === 'NUEVO' ? '<span style="color:var(--dark); font-family:var(--font-tech); font-weight:bold; font-size: 0.9rem; position:absolute; top:10px; left:10px; background:var(--primary); padding:5px 10px; z-index:20; letter-spacing:1px;">NUEVO</span>' : '';
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
                          <button class="add-btn" data-id="${product.id}" data-target="true">AÑADIR AL SISTEMA</button>
                      </div>
                  </div>
              `;
        catalogGrid.innerHTML += cardHTML;
      });

      attachCartAddLogic();
      attachModalLogic();
    }

    function attachCartAddLogic() {
      const addButtons = document.querySelectorAll('.add-btn');
      attachCursorHover(addButtons);
      addButtons.forEach(button => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-id');
          cart.push(productId);
          updateCartUI();

          const originalText = button.textContent;
          const card = button.closest('.product-card');

          // Feedback limpio sin corchetes
          button.textContent = 'DATOS GUARDADOS';
          button.style.backgroundColor = 'var(--secondary)';
          button.style.color = 'white';
          card.style.borderColor = 'var(--secondary)';

          if (cartPanel) cartPanel.classList.add('active');

          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = 'var(--gray)';
            button.style.color = 'var(--text-light)';
            card.style.borderColor = 'var(--primary)';
          }, 1000);
        });
      });
    }

    fetchArtCatalog();
  }


  /* ==========================================================================
     6. HUD DE INSPECCIÓN (MODAL)
     ========================================================================== */
  const modal = document.getElementById('artModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  function attachModalLogic() {
    const triggers = document.querySelectorAll('.modal-trigger');
    attachCursorHover(triggers);

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const productId = trigger.getAttribute('data-id');
        const product = artDatabase.find(p => p.id === productId);

        if (product && modal) {
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

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }


  /* ==========================================================================
     7. MODO TÁCTICO: ATAJOS DE TECLADO
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sideMenu && sideMenu.classList.contains('active')) sideMenu.classList.remove('active');
      if (cartPanel && cartPanel.classList.contains('active')) cartPanel.classList.remove('active');
      if (modal && modal.classList.contains('active')) modal.classList.remove('active');
    }
  });


  /* ==========================================================================
     8. SECUENCIA DE INICIO AL CARGAR
     ========================================================================== */
  updateCartUI();

});
