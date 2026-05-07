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
     01. CURSOR UNIVERSAL CIBERNÉTICO
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
     02. SISTEMA DE NAVEGACIÓN GLOBAL (MENÚ LATERAL, CARRITO Y FAVORITOS)
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

  // --- 02.1 Lógica del Menú Lateral (Navegación Principal) ---
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

  // --- 02.2 Despliegue del Panel de Base de Datos (Carrito) ---
  if (cartLink && cartPanel && closeCartBtn) {
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      cartPanel.classList.add('active');
    });
    closeCartBtn.addEventListener('click', () => cartPanel.classList.remove('active'));
  }

  // --- 02.3 Handler para Sistema de Favoritos (Restringido) ---
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert("SYS.OP // ADVERTENCIA: MÓDULO DE FAVORITOS ENCRIPTADO. DESBLOQUEO PENDIENTE.");
    });
  }


  /* ==========================================================================
     03. BASE DE DATOS ACTIVA (API EXTERNA)
     ========================================================================== */
  let artDatabase = []; // Memoria volátil para los resultados de la API


  /* ==========================================================================
     04. GESTIÓN DEL CARRITO DE COMPRAS (ALMACENAMIENTO DE OBJETOS)
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

      if (cart.length === 0) {
        // FIX ACCESIBILIDAD 2: Cambio de color #666 a #AAA para superar el contraste
        cartItemsContainer.innerHTML = '<p style="color:#AAA; font-family:var(--font-tech); margin-top:20px; text-transform:uppercase; letter-spacing: 1px;">SISTEMA VACÍO</p>';
        cartTotalValue.textContent = "0.00";
        return;
      }

      // Agrupamos por ID pero manteniendo los datos de la obra
      const groupedCart = {};
      cart.forEach(item => {
        if (!groupedCart[item.id]) {
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
    // Aumentar cantidad
    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const product = cart.find(item => item.id === id);
        if (product) {
          cart.push(product);
          updateCartUI();
        }
      });
    });

    // Disminuir cantidad
    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        for (let i = cart.length - 1; i >= 0; i--) {
          if (cart[i].id === id) {
            cart.splice(i, 1);
            break;
          }
        }
        updateCartUI();
      });
    });

    // Eliminar producto por completo
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
      });
    });
  }

  // Botón Deshacer
  const btnUndo = document.getElementById('btn-undo-cart');
  if (btnUndo) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnUndo]);
    btnUndo.addEventListener('click', () => {
      if (cart.length > 0) {
        cart.pop();
        updateCartUI();
      }
    });
  }

  // Botón Vaciar
  const btnVaciar = document.getElementById('btn-vaciar-carrito');
  if (btnVaciar) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnVaciar]);
    btnVaciar.addEventListener('click', () => {
      cart = [];
      updateCartUI();
    });
  }

  // Iniciamos la interfaz del carrito ahora que la data está limpia
  updateCartUI();


  /* ==========================================================================
     05. MOTOR DE CONEXIÓN API Y SIDEBAR AVANZADO (UNSPLASH)
     ========================================================================== */
  const catalogGrid = document.getElementById('catalog-grid');
  const UNSPLASH_ACCESS_KEY = 'qbxT7pHzE_NcgpASsVCQE1ZmgFA6jqEXt3x2Oh3TKpk';

  if (catalogGrid) {
    let currentPage = 1;
    let currentQuery = "cyberpunk neon";

    // --- Historial de Búsquedas ---
    let recentSearches = JSON.parse(localStorage.getItem('vh_recent_searches')) || [];

    function saveRecentSearch(query, imageUrl) {
      recentSearches = recentSearches.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      recentSearches.unshift({ query, img: imageUrl });
      if (recentSearches.length > 5) recentSearches.pop();
      localStorage.setItem('vh_recent_searches', JSON.stringify(recentSearches));
    }

    // --- 05.1 Lógica del Buscador Superior ---
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const tacticalKeywords = ['cyberpunk', 'neon city', 'mecha', 'robot', 'glitch art', 'vaporwave', 'synthwave', 'abstract 3d', 'dark sci-fi'];

    if (searchInput) {
      searchInput.addEventListener('focus', renderDropdown);

      document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) searchDropdown.classList.remove('active');
      });

      searchInput.addEventListener('input', () => {
        clearSearchBtn.style.display = searchInput.value.length > 0 ? 'block' : 'none';
        renderDropdown();
      });

      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        renderDropdown();
        searchInput.focus();
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
          searchDropdown.classList.remove('active');
          triggerSearch(searchInput.value.trim());
        }
      });
    }

    function renderDropdown() {
      if (!searchDropdown) return;

      const val = searchInput.value.toLowerCase().trim();
      searchDropdown.innerHTML = '';

      if (val === '') {
        if (recentSearches.length === 0) {
          searchDropdown.classList.remove('active');
          return;
        }
        searchDropdown.innerHTML = '<div class="dropdown-title">Búsquedas recientes</div>';
        recentSearches.forEach(item => {
          searchDropdown.innerHTML += `<div class="search-suggestion-item" onclick="triggerSearch('${item.query}')"><img src="${item.img}" alt="Reciente"><span>${item.query}</span></div>`;
        });
      } else {
        const suggestions = tacticalKeywords.filter(k => k.includes(val)).slice(0, 6);
        if (suggestions.length === 0) {
          searchDropdown.classList.remove('active');
          return;
        }
        searchDropdown.innerHTML = '<div class="dropdown-title">Sugerencias del sistema</div>';
        suggestions.forEach(sug => {
          searchDropdown.innerHTML += `<div class="search-suggestion-item" onclick="triggerSearch('${sug}')"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg><span>${sug}</span></div>`;
        });
      }
      searchDropdown.classList.add('active');
    }

    window.triggerSearch = function(query) {
      searchInput.value = query;
      searchDropdown.classList.remove('active');
      clearSearchBtn.style.display = 'block';

      // Reiniciamos los filtros visuales del sidebar al hacer búsqueda global
      document.querySelector('input[name="cat"][value="cyberpunk neon"]').checked = true;
      document.querySelector('input[name="col"][value=""]').checked = true;
      document.querySelector('input[name="ori"][value="landscape"]').checked = true;

      updateSidebarActiveClasses();
      window.executeAPI(query, true); // True = limpiar catálogo previo
    };

    // --- 05.2 Lógica del SIDEBAR de Filtros ---
    const matchCount = document.getElementById('matchCount');
    const priceFilter = document.getElementById('priceFilter');
    const priceLabel = document.getElementById('priceLabel');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Actualiza la clase "active" en el texto del radio button
    function updateSidebarActiveClasses() {
      document.querySelectorAll('.filter-option span').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.filter-option input:checked').forEach(input => {
        input.nextElementSibling.classList.add('active');
      });
    }

    // Listener para cambiar el texto del precio
    if (priceFilter) {
      priceFilter.addEventListener('input', (e) => {
        const val = e.target.value;
        priceLabel.textContent = val >= 200 ? "Cualquier precio" : `Menor a $${val}.00`;
        applyFrontendPriceFilter(); // Filtrar sin llamar a la API de nuevo
      });
    }

    // Aplicar filtros del sidebar cuando cambian
    document.querySelectorAll('.filter-option input').forEach(input => {
      input.addEventListener('change', () => {
        updateSidebarActiveClasses();
        // Construir query combinado
        const cat = document.querySelector('input[name="cat"]:checked').value;
        currentQuery = cat;

        if (searchInput) {
          searchInput.value = '';
          clearSearchBtn.style.display = 'none';
        }
        window.executeAPI(currentQuery, true); // true = reiniciar grid
      });
    });

    // Botón de Cargar Más
    if (loadMoreBtn) {
      if (typeof attachCursorHover === 'function') attachCursorHover([loadMoreBtn]);
      loadMoreBtn.addEventListener('click', () => {
        window.executeAPI(currentQuery, false); // false = añadir a lo existente
      });
    }

    // Botón de Limpiar Filtros
    if (clearFiltersBtn) {
      if (typeof attachCursorHover === 'function') attachCursorHover([clearFiltersBtn]);
      clearFiltersBtn.addEventListener('click', () => {
        document.querySelector('input[name="cat"][value="cyberpunk neon"]').checked = true;
        document.querySelector('input[name="col"][value=""]').checked = true;
        document.querySelector('input[name="ori"][value="landscape"]').checked = true;

        priceFilter.value = 200;
        priceLabel.textContent = "Cualquier precio";

        if (searchInput) {
          searchInput.value = '';
          clearSearchBtn.style.display = 'none';
        }

        updateSidebarActiveClasses();
        window.executeAPI("cyberpunk neon", true);
      });
    }

    // --- 05.3 Ejecutor Central de la API ---
    window.executeAPI = async function(query, isNewSearch = true) {
      try {
        if (isNewSearch) {
          currentPage = 1;
          catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-tech); font-size:1.2rem; grid-column: 1/-1; text-align:center;">[ PROCESANDO SOLICITUD EN RED UNSPLASH... ]</div>';
          loadMoreBtn.style.display = 'none';
        } else {
          currentPage++;
          loadMoreBtn.textContent = "[ DESCARGANDO... ]";
        }

        const col = document.querySelector('input[name="col"]:checked').value;
        const ori = document.querySelector('input[name="ori"]:checked').value;
        const safeQuery = encodeURIComponent(query);

        // Pedimos 30 items por página
        let url = `https://api.unsplash.com/search/photos?query=${safeQuery}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=30&page=${currentPage}&orientation=${ori}`;
        if (col !== "") url += `&color=${col}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Fallo en la comunicación');
        const json = await response.json();

        if (isNewSearch) matchCount.textContent = `${json.total} RESULTADOS`;

        const newItems = json.results.map((item, index) => {
          const priceCalc = (item.likes % 150) + 40;
          let itemTitle = item.description || item.alt_description || `ARCHIVO-${item.id.substring(0,4)}`;
          if (itemTitle.length > 30) itemTitle = itemTitle.substring(0, 30) + '...';

          // --- NUEVA LÓGICA INTELIGENTE DE ETIQUETAS ---
          let extractedTags = [];

          // 1. Si Unsplash nos da tags reales, los usamos
          if (item.tags && item.tags.length > 0) {
            extractedTags = item.tags.slice(0, 4).map(t => t.title);
          }
          // 2. Si no hay tags, usamos las palabras más largas de la descripción como tags
          else if (item.alt_description) {
            extractedTags = item.alt_description
              .replace(/[^a-zA-Z\s]/g, '') // Quitamos comas o puntos
              .split(' ')
              .filter(word => word.length > 4) // Solo palabras de más de 4 letras
              .slice(0, 3); // Tomamos máximo 3
          }
          // 3. Fallback absoluto de emergencia
          else {
            extractedTags = ["VECTOR", "SISTEMA", "OP-01"];
          }

          return {
            id: `VH-${item.id.substring(0, 5).toUpperCase()}`,
            title: itemTitle.toUpperCase(),
            artist: item.user.username,
            exhibitions: `Captura Visual / Año ${new Date(item.created_at).getFullYear()}`,
            desc: item.alt_description || "Datos corruptos o no disponibles en el servidor remoto.",
            image: item.urls.regular,
            price: priceCalc,
            rating: (item.likes % 3) + 3,
            status: (index % 5 === 0) ? 'NUEVO' : 'ESTANDAR',

            // --- DATOS TÁCTICOS ---
            hexColor: item.color || "#000000",
            dimensions: `${item.width} x ${item.height} PX`,
            likes: item.likes,

            // Inyectamos los tags inteligentes que acabamos de generar
            tags: extractedTags
          };
        });

        if (isNewSearch) {
          artDatabase = newItems;
          if (artDatabase.length > 0) saveRecentSearch(query, artDatabase[0].image);
        } else {
          artDatabase = artDatabase.concat(newItems);
        }

        applyFrontendPriceFilter(); // Dibuja la cuadrícula respetando el slider

        loadMoreBtn.style.display = newItems.length > 0 ? 'block' : 'none';
        loadMoreBtn.textContent = "CARGAR MÁS MÓDULOS";

        if (isNewSearch) initHeroCarousel();

      } catch (error) {
        if (isNewSearch) {
          catalogGrid.innerHTML = `<div style="color:#FF003C; grid-column: 1/-1; text-align:center;">SYS.ERR // CONEXIÓN INTERRUMPIDA</div>`;
        }
        loadMoreBtn.textContent = "ERROR AL CARGAR";
      }
    }

    // --- 05.4 Filtrado y Renderizado de Frontend ---

    // Filtrado puramente en Frontend para el Slider de Precio
    function applyFrontendPriceFilter() {
      const maxPrice = parseInt(priceFilter.value);
      const filteredDb = artDatabase.filter(item => item.price <= maxPrice);
      renderCatalogGrid(filteredDb);
    }

    function renderCatalogGrid(dataToRender) {
      catalogGrid.innerHTML = '';

      const archiveItems = dataToRender.length > 5 ? dataToRender.slice(5) : dataToRender;

      if (archiveItems.length === 0) {
        catalogGrid.innerHTML = '<div style="color:var(--primary); font-family:var(--font-tech); font-size:1.2rem; grid-column: 1 / -1; text-align:center;">[ NO HAY RESULTADOS EN ESTE RANGO DE PRECIO ]</div>';
        return;
      }

      archiveItems.forEach(product => {
        const isNew = product.status === 'NUEVO' ? '<span style="color:var(--dark); font-family:var(--font-tech); font-weight:bold; font-size: 0.9rem; position:absolute; top:10px; left:10px; background:var(--primary); padding:5px 10px; z-index:20;">NUEVO</span>' : '';

        // ESTRUCTURA 3D TIPO ESTUCHE INYECTADA
        catalogGrid.innerHTML += `
        <div class="product-card">
            <div class="card-header"><span class="serial">${product.id}</span><span class="status-dot"></span></div>

            <div class="flipper-container modal-trigger" data-id="${product.id}" data-target="true">
              <div class="card-flipper">

                <div class="card-front">
                    <img src="${product.image}" alt="${product.title}" class="real-art-img">
                    ${isNew}
                    <div class="scan-overlay"><div class="scan-text">INSPECCIONAR</div></div>
                </div>

                <div class="card-back">
                  <svg viewBox="0 0 24 24" class="restricted-icon" width="40" height="40" fill="var(--primary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  <p class="restricted-status">// ACCESO_CONCEDIDO</p>
                  <div class="tactical-barcode"></div>
                  <p class="data-stream">MÓDULO: ${product.id}<br>FIRMA HEX: ${product.hexColor}</p>
                </div>

              </div>
            </div>

            <div class="product-info">
                <h3 title="${product.title}">${product.title}</h3><p class="price">$${product.price.toFixed(2)}</p>
                <button class="add-btn" data-id="${product.id}" data-target="true">AÑADIR AL SISTEMA</button>
            </div>
        </div>`;
      });

      attachCartAddLogic();
      if (typeof attachModalLogic === 'function') attachModalLogic();
    }

    function attachCartAddLogic() {
      document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', () => {
          const productData = artDatabase.find(p => p.id === button.getAttribute('data-id'));

          if (productData) {
            cart.push(productData);
            updateCartUI();
          }

          const card = button.closest('.product-card');
          const originalText = button.textContent;

          button.textContent = 'DATOS GUARDADOS';
          button.style.backgroundColor = '#FFF';
          button.style.color = '#000';

          if (cartPanel) cartPanel.classList.add('active');

          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = 'transparent';
            button.style.color = 'var(--text-light)';
          }, 1000);
        });
      });
    }

    function initHeroCarousel() {
      const carouselContainer = document.getElementById('heroCarousel');
      if (!carouselContainer || artDatabase.length === 0) return;

      carouselContainer.innerHTML = '';

      artDatabase.slice(0, 5).forEach((product, i) => {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = `Obra destacada: ${product.title}`; // <--- FIX ACCESIBILIDAD 1
        img.className = 'carousel-img' + (i === 0 ? ' active' : '');
        carouselContainer.appendChild(img);
      });

      const images = carouselContainer.querySelectorAll('.carousel-img');

      if (window.heroInterval) clearInterval(window.heroInterval);

      if (images.length > 1) {
        let currentIndex = 0;
        window.heroInterval = setInterval(() => {
          images[currentIndex].classList.remove('active');
          currentIndex = (currentIndex + 1) % images.length;
          images[currentIndex].classList.add('active');
        }, 4500);
      }
    }

    // ARRANQUE INICIAL DEL SISTEMA
    window.executeAPI(currentQuery, true);
  }


  /* ==========================================================================
     06. SISTEMA DE MODAL TÁCTICO PARA INSPECCIÓN (PANTALLA COMPLETA)
     ========================================================================== */
  const modal = document.getElementById('artModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  // --- Lógica del Cubo de Datos Táctico de 6 Caras ---
  const btnModo3D = document.getElementById('btnModo3D');
  const modalImageContainer = document.getElementById('modalImageContainer'); // Padre contenedor
  const tacticalCube = document.getElementById('tacticalCube');
  const cubeFaces = document.querySelectorAll('.cube-face');
  const modalImageBase = document.getElementById('modalImageBase'); // Imagen base

  // Variables de control de rotación (Giroscópica)
  let is3DModeActive = false;

  if (btnModo3D && modalImageContainer && tacticalCube && cubeFaces) {
    if (typeof attachCursorHover === 'function') attachCursorHover([btnModo3D]);

    // Función para activar/desactivar el modo Cubo
    btnModo3D.addEventListener('click', () => {
      is3DModeActive = !is3DModeActive;

      if (is3DModeActive) {
        // Protocolo: Obtener URL y aplicar a las 6 caras
        const currentImageUrl = modalImageBase.querySelector('img').src;
        cubeFaces.forEach(face => { face.style.backgroundImage = `url(${currentImageUrl})`; });

        // Activación visual (USAMOS CLASE EN EL PADRE)
        modalImageContainer.classList.add('is-3d-active');
        btnModo3D.style.background = 'var(--primary)';
        btnModo3D.style.color = '#000';
        // Rotación inicial táctica
        tacticalCube.style.transform = `perspective(1200px) rotateX(-25deg) rotateY(-35deg)`;

      } else {
        // Desactivación visual
        modalImageContainer.classList.remove('is-3d-active');
        btnModo3D.style.background = 'rgba(10,10,10,0.8)';
        btnModo3D.style.color = 'var(--primary)';
        tacticalCube.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`; // Reset suave
      }
    });

    // Control Giroscópico (Seguimiento del Ratón)
    modalImageContainer.addEventListener('mousemove', (e) => {
      if (!is3DModeActive) return;

      const rect = modalImageContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculamos la rotación (lerp/suavizado táctico)
      const targetCubeY = ((e.clientX - centerX) / (rect.width / 2)) * 360;
      const targetCubeX = ((e.clientY - centerY) / (rect.height / 2)) * -360;

      // Aplicamos el seguimiento
      tacticalCube.style.transform = `perspective(1200px) rotateX(${targetCubeX}deg) rotateY(${targetCubeY}deg)`;
    });
  }

  // Función para cerrar el modal y buscar un tag (Exportada al objeto window)
  window.searchFromTag = function(tagWord) {
    if (modal) modal.classList.remove('active');

    // Scrollear hacia arriba
    const catalogContainer = document.getElementById('catalog-section');
    if (catalogContainer) catalogContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Limpiar sidebar y ejecutar búsqueda
    document.querySelectorAll('.filter-option span').forEach(s => s.classList.remove('active'));
    document.querySelector('input[name="col"][value=""]').checked = true;
    document.querySelector('input[name="ori"][value="landscape"]').checked = true;
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = tagWord;

    // Llamar a la función que creamos en la Sección 05
    if (typeof window.executeAPI === 'function') {
      window.executeAPI(tagWord, true);
    } else {
      console.warn("SYS.WARN // Redirigiendo búsqueda...");
    }
  };

  function attachModalLogic() {
    const triggers = document.querySelectorAll('.modal-trigger');
    if (typeof attachCursorHover === 'function') attachCursorHover(triggers);

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const productId = trigger.getAttribute('data-id');
        const product = artDatabase.find(p => p.id === productId);

        if (product && modal) {
          // Poblamiento de Datos Base en Modal
          document.getElementById('modalTitle').textContent = product.title;
          document.getElementById('modalArtist').textContent = product.artist;
          document.getElementById('modalExhibitions').textContent = product.exhibitions;
          document.getElementById('modalDesc').textContent = product.desc;

          // FIX TÁCTICO: Ahora inyectamos la imagen en 'modalImageBase'
          const imageBase = document.getElementById('modalImageBase');
          if (imageBase) {
            imageBase.innerHTML = `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: contain; filter: grayscale(20%) contrast(120%);">`;
          }

          // --- INYECCIÓN DE DATOS TÁCTICOS ---
          const dimEl = document.getElementById('modalDimensions');
          if (dimEl) dimEl.textContent = product.dimensions || "DATOS CLASIFICADOS";

          const likesEl = document.getElementById('modalLikes');
          if (likesEl) likesEl.textContent = product.likes ? product.likes.toLocaleString() : "0";

          // Muestra el código Hex y un cuadrito con el color real
          const hexEl = document.getElementById('modalHex');
          if (hexEl) {
            hexEl.innerHTML = `
                ${product.hexColor || "#000000"}
                <span style="display:inline-block; width:15px; height:15px; background-color:${product.hexColor || "#000"}; border:1px solid #444;"></span>
              `;
          }

          // Generador dinámico de Etiquetas (Tags)
          const tagsContainer = document.getElementById('modalTags');
          if (tagsContainer) {
            tagsContainer.innerHTML = '';
            if (product.tags && product.tags.length > 0) {
              product.tags.forEach(tag => {
                const cleanTag = tag.replace(/\s+/g, '-');
                tagsContainer.innerHTML += `
                    <button onclick="searchFromTag('${tag}')" style="border: 1px solid var(--primary); color: var(--primary); padding: 6px 12px; font-size: 0.75rem; font-family: var(--font-tech); text-transform: uppercase; background: rgba(212, 255, 0, 0.05); cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='#000';" onmouseout="this.style.background='rgba(212, 255, 0, 0.05)'; this.style.color='var(--primary)';">
                      #${cleanTag}
                    </button>`;
              });
            } else {
              tagsContainer.innerHTML = '<span style="color: #666; font-size: 0.8rem;">[ SIN ETIQUETAS REGISTRADAS ]</span>';
            }
          }

          // Generación de estrellas en base al rating
          let starsHTML = '';
          for (let i = 1; i <= 5; i++) {
            starsHTML += i <= product.rating ? '★' : '☆';
          }
          const ratingEl = document.getElementById('modalRating');
          if (ratingEl) ratingEl.textContent = starsHTML;

          // Desplegar Modal
          modal.classList.add('active');
        }
      });
    });
  }

  // Cierre manual del modal
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      // Apagamos el 3D al cerrar el modal por seguridad
      if (is3DModeActive) btnModo3D.click();
    });
  }


  /* ==========================================================================
     07. SOPORTE DE TECLADO TÁCTICO (Cierres con Escape)
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sideMenu && sideMenu.classList.contains('active')) sideMenu.classList.remove('active');
      if (cartPanel && cartPanel.classList.contains('active')) cartPanel.classList.remove('active');
      if (modal && modal.classList.contains('active')) modal.classList.remove('active');
    }
  });


  /* ==========================================================================
     08. FINALIZACIÓN Y VERIFICACIÓN POST-CARGA
     ========================================================================== */
  updateCartUI(); // Verificación redundante por seguridad de renderizado

  /* ==========================================================================
     09. MÓDULO EXPERIMENTAL 3D (HOLOGRAFÍA TILT)
     ========================================================================== */
  const initTiltEffect = () => {
    const cards3D = document.querySelectorAll('.product-card, .service-card');
    cards3D.forEach(card => {
      card.classList.add('tilt-3d-active');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // FIX: Suavizado táctico (lerp) y menos rotación (máx 6 grados)
        const tiltX = (e.clientY - rect.top - centerY) / centerY;
        const tiltY = (e.clientX - rect.left - centerX) / centerX;
        const rotateX = tiltX * -6; // Máximo 6 grados para no marear
        const rotateY = tiltY * 6;
        // Aplicamos la transformación suavizada
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        card.style.transition = 'transform 0.1s linear'; // Suavizado en tiempo real
        card.style.zIndex = '50';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease-out';
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.zIndex = '1';
      });
    });
  };
  setTimeout(initTiltEffect, 2000);

});
