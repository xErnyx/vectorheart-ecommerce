/**
 * ==========================================================================
 * VECTORHEART // SISTEMA DE FAVORITOS FUNCIONAL
 * V.1.0 - FUNCIONALIDADES COMPLETAS
 * ==========================================================================
 */

class FavoritesManager {
  constructor() {
    this.storageKey = 'vh_favorites';
    this.favorites = this.loadFavorites();
    this.initEventListeners();
  }

  /* 1. CARGA DE FAVORITOS DESDE LOCALSTORAGE */
  loadFavorites() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("SYS.WARN // Error cargando favoritos:", e);
      return [];
    }
  }

  /* 2. GUARDAR FAVORITOS EN LOCALSTORAGE */
  saveFavorites() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
  }

  /* 3. AÑADIR/REMOVER FAVORITO */
  toggleFavorite(productId, productData) {
    const index = this.favorites.findIndex(fav => fav.id === productId);
    
    if (index > -1) {
      this.favorites.splice(index, 1);
      this.updateUI(productId, false);
    } else {
      this.favorites.push(productData);
      this.updateUI(productId, true);
    }
    
    this.saveFavorites();
    this.updateFavoritesCount();
  }

  /* 4. VERIFICAR SI PRODUCTO ES FAVORITO */
  isFavorite(productId) {
    return this.favorites.some(fav => fav.id === productId);
  }

  /* 5. OBTENER FAVORITOS */
  getFavorites() {
    return this.favorites;
  }

  /* 6. LIMPIAR FAVORITOS */
  clearFavorites() {
    this.favorites = [];
    this.saveFavorites();
    this.updateFavoritesCount();
  }

  /* 7. ACTUALIZAR INTERFAZ (CAMBIAR COLOR DEL ICONO) */
  updateUI(productId, isFavorited) {
    const favBtn = document.querySelector(`[data-fav-id="${productId}"]`);
    if (favBtn) {
      if (isFavorited) {
        favBtn.classList.add('favorited');
        favBtn.style.color = 'var(--primary)';
      } else {
        favBtn.classList.remove('favorited');
        favBtn.style.color = 'var(--text-light)';
      }
    }
  }

  /* 8. ACTUALIZAR CONTADOR DE FAVORITOS */
  updateFavoritesCount() {
    const favCountBadge = document.getElementById('favCountBadge');
    if (favCountBadge) {
      favCountBadge.textContent = this.favorites.length;
      favCountBadge.style.display = this.favorites.length > 0 ? 'flex' : 'none';
    }
  }

  /* 9. INICIALIZAR EVENT LISTENERS GLOBALES */
  initEventListeners() {
    const favBtn = document.getElementById('favBtn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showFavoritesPanel();
      });
    }
  }

  /* 10. MOSTRAR PANEL DE FAVORITOS */
  showFavoritesPanel() {
    const panel = document.getElementById('favoritesPanel');
    if (!panel) {
      this.createFavoritesPanel();
      return;
    }
    panel.classList.add('active');
    this.renderFavorites();
  }

  /* 11. CREAR PANEL DE FAVORITOS (SIMILAR AL CARRITO) */
  createFavoritesPanel() {
    const panel = document.createElement('div');
    panel.id = 'favoritesPanel';
    panel.className = 'favorites-panel';
    panel.innerHTML = `
      <div class="favorites-header">
        <h2>FAVORITOS GUARDADOS</h2>
        <button class="close-favorites" id="closeFavoritesBtn" data-target="true">X</button>
      </div>
      <div class="favorites-container" id="favoritesContainer"></div>
      <div class="favorites-footer">
        <button class="btn-clear-favs" id="btnClearFavs" data-target="true">LIMPIAR TODO</button>
        <button class="btn-view-favs" id="btnViewFavs" data-target="true">VER EN TIENDA</button>
      </div>
    `;
    document.body.appendChild(panel);
    
    // Asignar eventos
    document.getElementById('closeFavoritesBtn').addEventListener('click', () => {
      panel.classList.remove('active');
    });
    document.getElementById('btnClearFavs').addEventListener('click', () => {
      if (confirm('¿Limpiar todos los favoritos?')) {
        this.clearFavorites();
        this.renderFavorites();
      }
    });
    document.getElementById('btnViewFavs').addEventListener('click', () => {
      window.location.href = 'index.html#catalog-grid';
    });
    
    this.renderFavorites();
    panel.classList.add('active');
  }

  /* 12. RENDERIZAR LISTA DE FAVORITOS */
  renderFavorites() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    
    if (this.favorites.length === 0) {
      container.innerHTML = '<p style="color:#888;font-family:var(--font-tech);text-align:center;padding:40px;letter-spacing:1px;">[ SIN ELEMENTOS FAVORITOS ]</p>';
      return;
    }
    
    container.innerHTML = '';
    this.favorites.forEach(product => {
      const html = `
        <div class="fav-item">
          <img src="${product.image}" alt="${product.title}">
          <div class="fav-info">
            <h4>${product.title}</h4>
            <p class="fav-price">$${product.price.toFixed(2)}</p>
            <div class="fav-tags">
              ${product.tags?.map(tag => `<span class="fav-tag">#${tag}</span>`).join('') || ''}
            </div>
          </div>
          <div class="fav-actions">
            <button class="btn-remove-fav" data-id="${product.id}" data-target="true">✕</button>
            <button class="btn-add-fav-cart" data-id="${product.id}" data-target="true">+ CARRITO</button>
          </div>
        </div>
      `;
      container.innerHTML += html;
    });
    
    // Eventos para remover y añadir al carrito
    document.querySelectorAll('.btn-remove-fav').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const product = this.favorites.find(f => f.id === id);
        this.toggleFavorite(id, product);
        this.renderFavorites();
      });
    });
    
    document.querySelectorAll('.btn-add-fav-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const product = this.favorites.find(f => f.id === id);
        if (window.addToCart) {
          window.addToCart(product);
          alert('Añadido al carrito desde favoritos');
        }
      });
    });
  }

  /* 13. CREAR BOTÓN FAVORITO EN TARJETAS DE PRODUCTO */
  createFavButton(productId, productData) {
    const btn = document.createElement('button');
    btn.className = 'fav-btn-card';
    btn.setAttribute('data-fav-id', productId);
    btn.setAttribute('data-target', 'true');
    btn.innerHTML = this.isFavorite(productId) ? '❤' : '♡';
    btn.style.color = this.isFavorite(productId) ? 'var(--primary)' : 'var(--text-light)';
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFavorite(productId, productData);
    });
    
    return btn;
  }

  /* 14. BÚSQUEDA EN FAVORITOS */
  searchInFavorites(query) {
    const lowerQuery = query.toLowerCase();
    return this.favorites.filter(fav => 
      fav.title.toLowerCase().includes(lowerQuery) ||
      fav.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

// Inicializar gestor de favoritos cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
  window.favoritesManager = new FavoritesManager();
  
  // Actualizar contador al cargar
  window.favoritesManager.updateFavoritesCount();
  
  // Cerrar panel al hacer clic fuera
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('favoritesPanel');
    const favBtn = document.getElementById('favBtn');
    if (panel && !panel.contains(e.target) && !favBtn.contains(e.target)) {
      panel.classList.remove('active');
    }
  });
  
  // Soporte para Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('favoritesPanel');
      if (panel) panel.classList.remove('active');
    }
  });
});
