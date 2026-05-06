const UI = {
    elements: {
        gamesGrid: document.getElementById('games-grid'),
        pagination: document.getElementById('pagination'),
        gameModal: document.getElementById('game-modal'),
        gameForm: document.getElementById('game-form'),
        modalTitle: document.getElementById('modal-title'),
        searchInput: document.getElementById('search-input'),
        sortSelect: document.getElementById('sort-select'),
        orderSelect: document.getElementById('order-select')
    },
    renderGames(games) {
        this.elements.gamesGrid.innerHTML = '';
        if (games.length === 0) {
            this.elements.gamesGrid.innerHTML = '<p class="loading">No se encontraron juegos.</p>';
            return;
        }
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            const imageUrl = game.image_url.startsWith('http') ? game.image_url : `${CONFIG.API_URL}${game.image_url}`;
            card.innerHTML = `
                <img src="${game.image_url ? imageUrl : 'https://via.placeholder.com/300x180'}" class="game-image">
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p>${game.genre} | ${game.release_year}</p>
                </div>
                <div class="game-actions">
                    <button onclick="handleEdit(${game.id})">Editar</button>
                    <button onclick="handleDelete(${game.id})">Eliminar</button>
                </div>`;
            this.elements.gamesGrid.appendChild(card);
        });
    },
    renderPagination(current, total) {
        this.elements.pagination.innerHTML = '';
        for (let i = 1; i <= total; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === current ? 'active' : ''}`;
            btn.innerText = i;
            btn.onclick = () => changePage(i);
            this.elements.pagination.appendChild(btn);
        }
    },
    showModal(title = 'Añadir Juego') {
        this.elements.modalTitle.innerText = title;
        this.elements.gameModal.style.display = 'block';
    },
    hideModal() {
        this.elements.gameModal.style.display = 'none';
        this.elements.gameForm.reset();
        document.getElementById('game-id').value = '';
    }
};
