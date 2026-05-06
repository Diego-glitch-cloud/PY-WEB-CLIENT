var PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180">' +
    '<rect width="300" height="180" fill="#e2e8f0"/>' +
    '<rect x="100" y="58" width="100" height="65" rx="28" stroke="#94a3b8" stroke-width="3" fill="none"/>' +
    '<line x1="118" y1="90" x2="134" y2="90" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="126" y1="82" x2="126" y2="98" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="164" cy="86" r="4" fill="#94a3b8"/>' +
    '<circle cx="174" cy="95" r="4" fill="#94a3b8"/>' +
    '</svg>'
);

const UI = {
    elements: {
        gamesGrid: document.getElementById('games-grid'),
        pagination: document.getElementById('pagination'),
        gameModal: document.getElementById('game-modal'),
        gameForm: document.getElementById('game-form'),
        modalTitle: document.getElementById('modal-title'),
        searchInput: document.getElementById('search-input'),
        sortSelect: document.getElementById('sort-select'),
        orderSelect: document.getElementById('order-select'),
        toastContainer: document.getElementById('toast-container'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmTitle: document.getElementById('confirm-title'),
        confirmMessage: document.getElementById('confirm-message'),
        confirmOk: document.getElementById('confirm-ok'),
        confirmCancel: document.getElementById('confirm-cancel')
    },

    renderGames(games) {
        this.elements.gamesGrid.innerHTML = '';
        if (games.length === 0) {
            this.renderEmptyState();
            return;
        }

        const EDIT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
        const DELETE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
        const DEV_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`;

        games.forEach((game, index) => {
            const card = document.createElement('div');
            card.className = 'game-card card-animate';
            card.style.animationDelay = `${index * 60}ms`;

            const imageUrl = game.image_url
                ? (game.image_url.startsWith('http') ? game.image_url : `${CONFIG.API_URL}${game.image_url}`)
                : PLACEHOLDER_IMG;

            const badges = [
                game.platform ? `<span class="badge badge-platform">${game.platform}</span>` : '',
                game.genre    ? `<span class="badge badge-genre">${game.genre}</span>`       : ''
            ].filter(Boolean).join('');

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imageUrl}" class="game-image" loading="lazy" alt="${game.title}"
                        onerror="this.onerror=null;this.src=PLACEHOLDER_IMG">
                </div>
                <div class="game-info">
                    ${badges ? `<div class="card-badges">${badges}</div>` : ''}
                    <h3 class="game-title">${game.title}</h3>
                    <p class="card-meta">
                        ${DEV_ICON}
                        <span>${game.developer || 'Desarrollador desconocido'}</span>
                        ${game.release_year ? `<span class="card-year">${game.release_year}</span>` : ''}
                    </p>
                    ${game.description ? `<p class="card-description">${game.description}</p>` : ''}
                    <div class="card-rating" data-game-id="${game.id}"></div>
                </div>
                <div class="game-actions">
                    <button class="btn-edit" aria-label="Editar ${game.title}" onclick="handleEdit(${game.id})">
                        ${EDIT_ICON} Editar
                    </button>
                    <button class="btn-danger" aria-label="Eliminar ${game.title}" onclick="handleDelete(${game.id})">
                        ${DELETE_ICON} Eliminar
                    </button>
                </div>`;

            card.querySelector('.card-rating').appendChild(
                this.createStarRating(game.id, 0, 0)
            );

            this.elements.gamesGrid.appendChild(card);
        });
    },

    renderPagination(current, total) {
        this.elements.pagination.innerHTML = '';
        if (total <= 1) return;

        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === current ? 'active' : ''}`;
            btn.innerText = i;
            btn.onclick = () => changePage(i);
            this.elements.pagination.appendChild(btn);
        }
    },

    showModal(title = 'Añadir Juego') {
        this.clearErrors();
        this.elements.modalTitle.innerText = title;
        this.elements.gameModal.style.display = 'block';
    },

    hideModal() {
        this.elements.gameModal.style.display = 'none';
        this.elements.gameForm.reset();
        document.getElementById('game-id').value = '';
        this.clearErrors();
    },

    showLoading() {
        this.elements.gamesGrid.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-muted)">Cargando videojuegos...</p>
            </div>
        `;
    },

    renderEmptyState() {
        this.elements.gamesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎮</div>
                <h2>No se encontraron juegos</h2>
                <p>Intenta con otros filtros o términos de búsqueda.</p>
            </div>
        `;
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <span style="cursor:pointer; margin-left: 1rem;" onclick="this.parentElement.remove()">×</span>
        `;
        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showConfirm(title, message) {
        return new Promise((resolve) => {
            this.elements.confirmTitle.innerText = title;
            this.elements.confirmMessage.innerText = message;
            this.elements.confirmModal.style.display = 'block';

            const onOk = () => {
                this.elements.confirmModal.style.display = 'none';
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                this.elements.confirmModal.style.display = 'none';
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                this.elements.confirmOk.removeEventListener('click', onOk);
                this.elements.confirmCancel.removeEventListener('click', onCancel);
            };

            this.elements.confirmOk.addEventListener('click', onOk);
            this.elements.confirmCancel.addEventListener('click', onCancel);
        });
    },

    createStarRating(gameId, average, count) {
        const wrapper = document.createElement('div');
        wrapper.className = 'stars-container';

        const filled = Math.round(average);
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= filled ? ' filled' : '');
            star.textContent = '★';
            star.setAttribute('aria-label', `Calificar ${i} de 5`);
            star.setAttribute('role', 'button');
            star.setAttribute('tabindex', '0');

            star.addEventListener('mouseenter', () => {
                stars.forEach((s, idx) => s.classList.toggle('hovered', idx < i));
            });
            star.addEventListener('click', () => handleRate(gameId, i));
            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') handleRate(gameId, i);
            });

            stars.push(star);
            wrapper.appendChild(star);
        }

        wrapper.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });

        const info = document.createElement('span');
        info.className = 'rating-info';
        info.textContent = count > 0 ? `${parseFloat(average).toFixed(1)} (${count})` : 'Sin calificar';
        wrapper.appendChild(info);

        return wrapper;
    },

    updateStarRating(gameId, average, count) {
        const container = this.elements.gamesGrid.querySelector(
            `.card-rating[data-game-id="${gameId}"]`
        );
        if (!container) return;
        container.innerHTML = '';
        container.appendChild(this.createStarRating(gameId, average, count));
    },

    showFieldError: (fieldId, message) => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add('input-error');
            const errorMsg = document.createElement('p');
            errorMsg.className = 'field-error';
            errorMsg.innerText = message;
            input.parentNode.appendChild(errorMsg);
        }
    },

    updateResultsCount: (count) => {
        const el = document.getElementById('results-count');
        if (el) {
            el.innerText = `${count} ${count === 1 ? 'videojuego' : 'videojuegos'}`;
        }
    },

    clearErrors: () => {

        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }
};
