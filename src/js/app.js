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
       3. BASE DE DATOS ACTIVA (API EXTERNA)
       ========================================================================== */
  let artDatabase = []; // Memoria volátil para los resultados de la API

  /* ==========================================================================
     4. GESTIÓN DEL CARRITO DE COMPRAS (ALMACENAMIENTO DE OBJETOS)
     ========================================================================== */
  let cart = JSON.parse(localStorage.getItem('vh_cart_items')) || [];

  // [ ! ] PROTOCOLO DE DEFENSA: Purgar carrito si tiene el formato viejo (strings)
  // Esto evita que el sistema se cuelgue al intentar leer la memoria antigua
  if (cart.length > 0 && typeof cart[0] !== 'object') {
    console.warn("SYS.WARN // Caché antigua detectada. Purgando carrito para evitar conflicto de datos.");
    cart = [];
    localStorage.removeItem('vh_cart_items');
  }

  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartTotalValue = document.getElementById('cartTotalValue');

  function updateCartUI() {
    if (cartPanel && cartLink) {
      const badge = document.getElementById('cartCountBadge');
      if (badge) badge.textContent = cart.length;

      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
      cartItemsContainer.innerHTML = '';
      let total = 0;

      if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:#666; font-family:var(--font-tech); margin-top:20px; text-transform:uppercase; letter-spacing: 1px;">SISTEMA VACÍO</p>';
        cartTotalValue.textContent = "0.00";
        return;
      }

      // Agrupamos por ID pero manteniendo los datos de la obra
      const groupedCart = {};
      cart.forEach(item => {
        if(!groupedCart[item.id]) {
          groupedCart[item.id] = { ...item, qty: 0 };
        }
        groupedCart[item.id].qty += 1;
      });

      // Dibujamos el carrito
      Object.values(groupedCart).forEach(product => {
        total += (product.price * product.qty);
        const itemHTML = `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.title}">
                <div class="cart-item-info">
                    <h4>${product.title}</h4>
                    <p>$${product.price.toFixed(2)}</p>
                    <div class="cart-item-qty">
                        <button class="qty-btn minus-btn" data-id="${product.id}">-</button>
                        <span style="font-family: var(--font-tech); font-size: 0.95rem; width: 20px; text-align: center;">${product.qty}</span>
                        <button class="qty-btn plus-btn" data-id="${product.id}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${product.id}" data-target="true">Eliminar</button>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
      });

      cartTotalValue.textContent = total.toFixed(2);
      attachCartControls();
    } else {
      localStorage.setItem('vh_cart_items', JSON.stringify(cart));
    }
  }

  function attachCartControls() {
    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const product = cart.find(item => item.id === id);
        if(product) { cart.push(product); updateCartUI(); }
      });
    });

    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        for (let i = cart.length - 1; i >= 0; i--) {
          if (cart[i].id === id) { cart.splice(i, 1); break; }
        }
        updateCartUI();
      });
    });

    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
      });
    });
  }

  const btnUndo = document.getElementById('btn-undo-cart');
  if (btnUndo) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnUndo]);
    btnUndo.addEventListener('click', () => { if (cart.length > 0) { cart.pop(); updateCartUI(); } });
  }

  const btnVaciar = document.getElementById('btn-vaciar-carrito');
  if (btnVaciar) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnVaciar]);
    btnVaciar.addEventListener('click', () => { cart = []; updateCartUI(); });
  }

  // Iniciamos la interfaz del carrito ahora que la data está limpia
  updateCartUI();


  /* ==========================================================================
     5. MOTOR DE CONEXIÓN API: ART INSTITUTE OF CHICAGO
     ========================================================================== */
  const catalogGrid = document.getElementById('catalog-grid');

  if (catalogGrid) {

    // --- 5.1 Función Principal de Extracción (Fetch a la API) ---
    async function fetchArtFromAPI(query = "Contemporary Art") {
      try {
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-tech); font-size:1.5rem; grid-column: 1 / -1; text-align:center; padding: 50px 0; letter-spacing: 2px;">[ ESTABLECIENDO ENLACE CON SERVIDOR EXTERNO... ]</div>';

        // Codificamos la búsqueda para evitar que los espacios rompan la URL
        const safeQuery = encodeURIComponent(query);
        // Pedimos 50 resultados para asegurarnos de tener suficientes imágenes válidas
        const url = `https://api.artic.edu/api/v1/artworks/search?q=${safeQuery}&fields=id,title,artist_display,image_id,thumbnail,date_display,medium_display&limit=50`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Conexión interceptada');

        const json = await response.json();

        // Mapeo y Adaptación de datos
        artDatabase = json.data
          .filter(item => item.image_id) // Descartamos las que no tengan imagen
          .map(item => {
            const priceCalc = (item.id % 150) + 40;
            const ratingCalc = (item.id % 3) + 3;

            return {
              id: item.id.toString(),
              title: item.title,
              artist: item.artist_display || "Autor Desconocido",
              exhibitions: item.date_display || "Fecha Clasificada",
              desc: (item.thumbnail && item.thumbnail.alt_text) ? item.thumbnail.alt_text : (item.medium_display || "Sin descripción táctica en los archivos."),
              image: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
              price: priceCalc,
              rating: ratingCalc,
              status: (item.id % 5 === 0) ? 'NUEVO' : 'ESTANDAR'
            };
          });

        if (artDatabase.length === 0) {
          catalogGrid.innerHTML = '<div style="color:#FF003C; font-family:var(--font-tech); font-size:1.2rem; grid-column: 1 / -1; text-align:center; padding: 50px 0;">[ RESULTADO VACÍO: RECALIBRAR BÚSQUEDA ]</div>';
          initHeroCarousel(); // Por si hay datos viejos en el hero, los limpia
          return;
        }

        renderCatalog();
        initHeroCarousel();

      } catch (error) {
        console.error("Fallo de sistema:", error);
        catalogGrid.innerHTML = '<div style="color:#FF003C; font-family:var(--font-heading); font-size:2rem; grid-column: 1 / -1; text-align:center; padding: 50px 0;">ERROR DE CONEXIÓN: API DESCONECTADA</div>';
      }
    }

    // --- 5.2 Controladores de Búsqueda y Filtros ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');

    filterBtns.forEach(btn => {
      if (typeof attachCursorHover === 'function') attachCursorHover([btn]);
      btn.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        fetchArtFromAPI(btn.getAttribute('data-query'));
        catalogGrid.scrollIntoView({behavior: 'smooth', block: 'start'});
      });
    });

    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
          filterBtns.forEach(b => b.classList.remove('active'));
          fetchArtFromAPI(searchInput.value.trim());
          catalogGrid.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      });
    }

    // --- 5.3 Generación Dinámica del HTML ---
    function renderCatalog() {
      catalogGrid.innerHTML = '';

      // Reservamos hasta 5 imágenes para el Hero Banner, el resto va al catálogo
      const archiveItems = artDatabase.length > 5 ? artDatabase.slice(5) : artDatabase;

      if(archiveItems.length === 0) {
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-tech); font-size:1.2rem; grid-column: 1 / -1; text-align:center;">[ NO HAY SUFICIENTES REGISTROS PARA ESTA CATEGORÍA ]</div>';
        return;
      }

      archiveItems.forEach(product => {
        const isNew = product.status === 'NUEVO' ? '<span style="color:var(--dark); font-family:var(--font-tech); font-weight:bold; font-size: 0.9rem; position:absolute; top:10px; left:10px; background:var(--primary); padding:5px 10px; z-index:20; letter-spacing:1px;">NUEVO</span>' : '';

        const cardHTML = `
      <div class="product-card">
          <div class="card-header"><span class="serial">#${product.id}</span><span class="status-dot"></span></div>
          <div class="product-image modal-trigger" data-id="${product.id}" data-target="true">
              <img src="${product.image}" alt="${product.title}" class="real-art-img">
              ${isNew}
              <div class="scan-overlay"><div class="scan-text">INSPECCIONAR</div></div>
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
      if (typeof attachModalLogic === 'function') attachModalLogic();
    }

    // --- 5.4 Lógica visual al añadir al carrito ---
    function attachCartAddLogic() {
      const addButtons = document.querySelectorAll('.add-btn');
      if (typeof attachCursorHover === 'function') attachCursorHover(addButtons);

      addButtons.forEach(button => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-id');
          // Guardamos el objeto entero
          const productData = artDatabase.find(p => p.id === productId);
          if (productData) {
            cart.push(productData);
            updateCartUI();
          }

          const originalText = button.textContent;
          const card = button.closest('.product-card');

          button.textContent = 'DATOS GUARDADOS';
          button.style.backgroundColor = '#FFF';
          button.style.color = '#000';
          button.style.borderColor = '#FFF';
          card.style.borderColor = '#FFF';

          if (cartPanel) cartPanel.classList.add('active');

          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = 'transparent';
            button.style.color = 'var(--text-light)';
            button.style.borderColor = '#555';
            card.style.borderColor = '#333';
          }, 1000);
        });
      });
    }

    // --- 5.5 Animador de Slider del Banner Superior (Hero) ---
    function initHeroCarousel() {
      const carouselContainer = document.getElementById('heroCarousel');
      if (!carouselContainer) return;

      carouselContainer.querySelectorAll('.carousel-img').forEach(img => img.remove());

      if (artDatabase.length === 0) return;

      const carouselItems = artDatabase.slice(0, 5);
      let currentIndex = 0;

      carouselItems.forEach((product, index) => {
        const img = document.createElement('img');
        img.src = product.image;
        img.className = 'carousel-img' + (index === 0 ? ' active' : '');
        carouselContainer.appendChild(img);
      });

      const images = carouselContainer.querySelectorAll('.carousel-img');

      if(window.heroInterval) clearInterval(window.heroInterval);

      if (images.length > 1) {
        window.heroInterval = setInterval(() => {
          images[currentIndex].classList.remove('active');
          currentIndex = (currentIndex + 1) % images.length;
          images[currentIndex].classList.add('active');
        }, 4500);
      }
    }

    // ARRANQUE DEL SISTEMA
    fetchArtFromAPI("Contemporary Art");
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
