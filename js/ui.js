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
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            const imageUrl = game.image_url 
                ? (game.image_url.startsWith('http') ? game.image_url : `${CONFIG.API_URL}${game.image_url}`)
                : 'https://via.placeholder.com/300x180';

            card.innerHTML = `
                <img src="${imageUrl}" class="game-image">
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p>${game.genre} | ${game.release_year}</p>
                </div>
                <div class="game-actions">
                    <button class="btn-primary" onclick="handleEdit(${game.id})">Editar</button>
                    <button class="btn-danger" onclick="handleDelete(${game.id})">Eliminar</button>
                </div>`;
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

    showFieldError(fieldName, message) {
        const input = document.getElementById(fieldName);
        if (!input) return;

        input.classList.add('input-error');
        const errorMsg = document.createElement('p');
        errorMsg.className = 'field-error';
        errorMsg.innerText = message;
        input.parentElement.appendChild(errorMsg);
    },

    clearErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.field-error').forEach(el => el.remove());
    }
};
