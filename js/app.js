/**
 * ==========================================================================
 * VECTORHEART // CEREBRO DEL SISTEMA (APP.JS)
 * V.2.0 - MODO HÍBRIDO ESTABLE
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mensaje oculto en la consola para los curiosos
  console.log("%c[SYSTEM BOOT] Vectorheart V.2 // MODO_HIBRIDO_ESTABLE.", "color: #E60000; font-family: monospace; font-size: 14px; font-weight: bold;");

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

  // Solo se activa si los botones existen en la página actual
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
     3. BASE DE DATOS DE ARTE (AHORA ALIMENTADA POR API EXTERNA)
     ========================================================================== */
  let artDatabase = []; // Inicia completamente vacía, se llenará con el JSON


  /* ==========================================================================
     4. CARRITO DE COMPRAS Y ALMACENAMIENTO (LOCALSTORAGE)
     ========================================================================== */
  // Recupera el carrito guardado en el navegador o inicia vacío
  let cart = JSON.parse(localStorage.getItem('vh_cart_items')) || [];

  const cartLink = document.querySelector('.cart-link');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalValue = document.getElementById('cartTotalValue');

  // Dibuja los productos guardados en el panel del carrito
  function updateCartUI() {
    if (cartPanel && cartLink) {
      // Solo actualiza el texto del botón si es el de carrito (protege otros links)
      if (cartLink.textContent.includes('CARRITO') || cartLink.textContent.includes('0')) {
        cartLink.textContent = `CARRITO (${cart.length})`;
      }

      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
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
      attachRemoveLogic(); // Refresca los botones de borrar
    } else {
      // Si no existe el panel (ej. página de misión), solo guarda en memoria oculta
      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
    }
  }

  // Permite borrar items del carrito
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

  // Controles de apertura y cierre del panel lateral
  if (cartLink && cartPanel && closeCartBtn) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      cartPanel.classList.add('active');
    });
    closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));
  }

  // Lógica para el botón de Purgar Sistema (Vaciar Todo)
  const btnVaciar = document.getElementById('btn-vaciar-carrito');
  if (btnVaciar) {
    attachCursorHover([btnVaciar]); // Para que el cursor reaccione a este botón
    btnVaciar.addEventListener('click', () => {
      cart = []; // Vaciamos el arreglo
      updateCartUI(); // Redibujamos la interfaz y guardamos en memoria
    });
  }

  /* ==========================================================================
     5. RENDERIZADO DEL CATÁLOGO (Solo para index.html)
     ========================================================================== */
  const catalogGrid = document.getElementById('catalog-grid');

  if (catalogGrid) {
    // NUEVA FUNCIÓN ASÍNCRONA: Simula la llamada a la API
    async function fetchArtCatalog() {
      try {
        // Muestra mensaje de carga cibernético
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-size:2rem; grid-column: 1 / -1; text-align:center;">[ CONECTANDO CON SERVIDOR DE CATÁLOGO... ]</div>';

        const response = await fetch('./productos.json');

        if (!response.ok) throw new Error('Error en la conexión del servidor');

        // Guardamos los datos en nuestra variable global
        artDatabase = await response.json();

        // Una vez que tenemos los datos, dibujamos la tienda
        renderCatalog();

        // ¡LA SOLUCIÓN AL BUG ESTÁ AQUÍ!
        // Ahora sí dibujamos el carrito porque ya tenemos la base de datos cargada
        updateCartUI();

      } catch (error) {
        console.error("Fallo de sistema:", error);
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-size:2rem; grid-column: 1 / -1; text-align:center;">[ ERROR DE CONEXIÓN // CATÁLOGO CORRUPTO ]</div>';
      }
    }

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

    // Funcionalidad de "Añadir al Carrito"
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
          button.textContent = '[ DATOS_GUARDADOS ]';
          button.style.backgroundColor = 'var(--secondary)';
          card.style.borderColor = 'var(--secondary)';

          if (cartPanel) cartPanel.classList.add('active');

          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = 'var(--dark)';
            card.style.borderColor = 'var(--dark)';
          }, 1000);
        });
      });
    }

    // INICIAMOS LA DESCARGA
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
          // Inyectar datos en la ventana emergente
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
      // 1. Cerrar Menú Lateral
      if (sideMenu && sideMenu.classList.contains('active')) {
        sideMenu.classList.remove('active');
      }
      // 2. Cerrar Carrito de Compras
      if (cartPanel && cartPanel.classList.contains('active')) {
        cartPanel.classList.remove('active');
      }
      // 3. Cerrar el Modal (Ventana de inspección de arte)
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    }
  });


  /* ==========================================================================
     8. SECUENCIA DE INICIO AL CARGAR
     ========================================================================== */
  updateCartUI();

});
