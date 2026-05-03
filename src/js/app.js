/**
 * ==========================================================================
 * VECTORHEART // CEREBRO DEL SISTEMA (APP.JS)
 * V.3.0 - MARATHON EDITION
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mensaje oculto en la consola para los operadores curiosos
  console.log("%c[SYSTEM BOOT] Vectorheart V.3 // TACTICAL_HUD_ACTIVE.", "color: #D4FF00; font-family: monospace; font-size: 14px; font-weight: bold; background: #000; padding: 5px;");

  /* ==========================================================================
     1. CURSOR UNIVERSAL CIBERNÉTICO
     ========================================================================== */
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = '<div id="cursor-coords">X:0 Y:0</div>';
  document.body.appendChild(cursor);
  const coords = document.getElementById('cursor-coords');

  // Mueve el cursor siguiendo las coordenadas del ratón en pantalla
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    coords.textContent = `X:${e.clientX} Y:${e.clientY}`;
  });

  // Función global para inyectar la animación táctica de "hover" a elementos interactivos
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

  // Aplicamos el efecto hover a todos los enlaces y botones renderizados inicialmente
  attachCursorHover(document.querySelectorAll('a, button, [data-target="true"]'));


  /* ==========================================================================
     2. SISTEMA DE NAVEGACIÓN GLOBAL (MENÚ LATERAL, CARRITO Y FAVORITOS)
     ========================================================================== */
  // Referencias al DOM (Navegación y Botonera Global)
  const menuBtn = document.getElementById('menuBtn');
  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const menuLinks = document.querySelectorAll('.menu-links a');

  const cartLink = document.querySelector('.cart-link');
  const cartPanel = document.getElementById('cartPanel');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const favBtn = document.getElementById('favBtn');

  // --- 2.1 Lógica del Menú Lateral (Navegación Principal) ---
  if (menuBtn && closeMenuBtn && sideMenu) {
    // Apertura y cierre del menú
    menuBtn.addEventListener('click', () => sideMenu.classList.add('active'));
    closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('active'));

    // Cierre forzado al hacer clic fuera de la zona del menú
    document.addEventListener('click', (event) => {
      if (sideMenu.classList.contains('active') && !sideMenu.contains(event.target) && !menuBtn.contains(event.target)) {
        sideMenu.classList.remove('active');
      }
    });

    // Cierre inteligente tras hacer clic en un ancla o enlace interno
    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetUrl = link.getAttribute('href');
        sideMenu.classList.remove('active');

        // Navegación suave a anclas (ej. "#catalog-grid")
        if (targetUrl.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(targetUrl);
          if (targetElement) {
            setTimeout(() => targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
          }
        }
      });
    });
  }

  // --- 2.2 Despliegue del Panel de Base de Datos (Carrito) ---
  if (cartLink && cartPanel && closeCartBtn) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      cartPanel.classList.add('active');
    });
    closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));
  }

  // --- 2.3 Handler para Sistema de Favoritos (Restringido) ---
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert("SYS.OP // ADVERTENCIA: MÓDULO DE FAVORITOS ENCRIPTADO. DESBLOQUEO PENDIENTE.");
    });
  }


  /* ==========================================================================
     3. CONEXIÓN A BASE DE DATOS LOCAL (JSON) Y CARGA DE DATOS MUNDIALES
     ========================================================================== */
  let artDatabase = []; // Variable global de almacenamiento de obras de arte

  async function initSystemData() {
    try {
      // Conexión fetch a la ruta JSON asíncrona
      const response = await fetch('data/productos.json');
      const data = await response.json();
      artDatabase = data;

      // Sincronización Inmediata del Carrito desde LocalStorage (Para cualquier página)
      updateCartUI();

      // Disparador condicional: Si estamos en el home (index.html), renderizamos la tienda
      const catalogGrid = document.getElementById('catalog-grid');
      if (catalogGrid && typeof renderCatalog === 'function') {
        renderCatalog();
      }
    } catch (error) {
      console.error("SYS.ERR // Error de conexión con la base de datos de arte:", error);
    }
  }

  // Ejecución de la rutina principal al cargar la aplicación
  initSystemData();


  /* ==========================================================================
     4. GESTIÓN DEL CARRITO DE COMPRAS Y LOCALSTORAGE
     ========================================================================== */
  // Inicialización o recuperación de la memoria persistente del usuario
  let cart = JSON.parse(localStorage.getItem('vh_cart_items')) || [];

  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalValue = document.getElementById('cartTotalValue');

  // Función que refresca el renderizado lateral del carrito calculando totales
  function updateCartUI() {
    if (cartPanel && cartLink) {
      // Actualizamos contador/badge global
      const badge = document.getElementById('cartCountBadge');
      if (badge) badge.textContent = cart.length;

      // Salvamos en la memoria caché persistente del navegador
      localStorage.setItem('vh_cart_items', JSON.stringify(cart));

      // Limpiamos contenedor para redibujar
      cartItemsContainer.innerHTML = '';
      let total = 0;

      // Manejo de estado vacío
      if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:#666; font-family:var(--font-tech); margin-top:20px; text-transform:uppercase; letter-spacing: 1px;">SISTEMA VACÍO</p>';
      }

      // Dibujo de productos iterativo
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

      // Adherimos interactividad a los botones recién generados (Borrar Elemento)
      attachRemoveLogic();
    } else {
      // Sincronización silenciosa en páginas sin vista de carrito
      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
    }
  }

  // --- Funcionalidad de purga del carrito (Botones dinámicos) ---
  function attachRemoveLogic() {
    const removeBtns = document.querySelectorAll('.remove-item-btn');
    if (typeof attachCursorHover === 'function') attachCursorHover(removeBtns);

    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const itemIndex = btn.getAttribute('data-index');
        cart.splice(itemIndex, 1);
        updateCartUI(); // Redibujar sistema
      });
    });
  }

  // --- Funcionalidad de Borrado Masivo (Purga Total) ---
  const btnVaciar = document.getElementById('btn-vaciar-carrito');
  if (btnVaciar) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnVaciar]);
    btnVaciar.addEventListener('click', () => {
      cart = [];
      updateCartUI();
    });
  }


  /* ==========================================================================
     5. RENDERIZADO CONDICIONAL DE TIENDA Y HERO (Exclusivo de INDEX.HTML)
     ========================================================================== */
  const catalogGrid = document.getElementById('catalog-grid');

  if (catalogGrid) {
    // Función central de fetch y setup
    async function fetchArtCatalog() {
      try {
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-heading); font-size:2rem; grid-column: 1 / -1; text-align:center;">CONECTANDO CON SERVIDOR...</div>';
        const response = await fetch('data/productos.json');

        if (!response.ok) throw new Error('Error en la conexión del servidor');

        artDatabase = await response.json();

        renderCatalog();   // Módulo 5.1
        updateCartUI();    // Módulo 4
        initHeroCarousel(); // Módulo 5.3

      } catch (error) {
        console.error("Fallo de sistema:", error);
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-heading); font-size:2rem; grid-column: 1 / -1; text-align:center;">ERROR DE CONEXIÓN: CATÁLOGO CORRUPTO</div>';
      }
    }

    // --- 5.1 Generación Dinámica del HTML de los Productos ---
    function renderCatalog() {
      catalogGrid.innerHTML = '';
      const archiveItems = artDatabase.slice(5); // Ignoramos los primeros 5 (exclusivos del Hero)

      archiveItems.forEach(product => {
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

      // Adherir interactividad a elementos creados al vuelo
      attachCartAddLogic();
      attachModalLogic();
    }

    // --- 5.2 Lógica visual y funcional al añadir al carrito ---
    function attachCartAddLogic() {
      const addButtons = document.querySelectorAll('.add-btn');
      attachCursorHover(addButtons);

      addButtons.forEach(button => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-id');
          cart.push(productId);
          updateCartUI();

          // Efecto de confirmación estilo consola
          const originalText = button.textContent;
          const card = button.closest('.product-card');

          button.textContent = 'DATOS GUARDADOS';
          button.style.backgroundColor = 'var(--secondary)';
          button.style.color = 'white';
          card.style.borderColor = 'var(--secondary)';

          // Animación para atraer la vista del usuario
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

    // --- 5.3 Animador de Slider del Banner Superior (Hero) ---
    function initHeroCarousel() {
      const carouselContainer = document.getElementById('heroCarousel');
      if (!carouselContainer || artDatabase.length === 0) return;

      const carouselItems = artDatabase.slice(0, 5); // Consumimos solo los primeros 5
      let currentIndex = 0;

      const scanline = carouselContainer.querySelector('.hero-scanline');

      // Setup Inicial
      carouselItems.forEach((product, index) => {
        const img = document.createElement('img');
        img.src = product.image;
        img.className = 'carousel-img' + (index === 0 ? ' active' : '');
        carouselContainer.insertBefore(img, scanline);
      });

      // Transición infinita
      const images = document.querySelectorAll('.carousel-img');
      if (images.length > 1) {
        setInterval(() => {
          images[currentIndex].classList.remove('active');
          currentIndex = (currentIndex + 1) % images.length;
          images[currentIndex].classList.add('active');
        }, 4500);
      }
    }

    // Inicio forzado de la cadena
    fetchArtCatalog();
  }


  /* ==========================================================================
     6. SISTEMA DE MODAL TÁCTICO PARA INSPECCIÓN (PANTALLA COMPLETA)
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
          // Poblamiento de Datos en Modal
          document.getElementById('modalTitle').textContent = product.title;
          document.getElementById('modalArtist').textContent = product.artist;
          document.getElementById('modalExhibitions').textContent = product.exhibitions;
          document.getElementById('modalDesc').textContent = product.desc;
          document.getElementById('modalImage').innerHTML = `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(20%) contrast(120%);">`;

          // Generación de estrellas en base al rating
          let starsHTML = '';
          for (let i = 1; i <= 5; i++) { starsHTML += i <= product.rating ? '★' : '☆'; }
          document.getElementById('modalRating').textContent = starsHTML;

          modal.classList.add('active');
        }
      });
    });
  }

  // Cierre manual del modal
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }


  /* ==========================================================================
     7. SOPORTE DE TECLADO TÁCTICO (Cierres con Escape)
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sideMenu && sideMenu.classList.contains('active')) sideMenu.classList.remove('active');
      if (cartPanel && cartPanel.classList.contains('active')) cartPanel.classList.remove('active');
      if (modal && modal.classList.contains('active')) modal.classList.remove('active');
    }
  });


  /* ==========================================================================
     8. FINALIZACIÓN Y VERIFICACIÓN POST-CARGA
     ========================================================================== */
  updateCartUI(); // Verificación redundante por seguridad de renderizado

});
