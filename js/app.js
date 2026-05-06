const state = { page: 1, limit: 12, q: '', sort: 'created_at', order: 'desc' };

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEvents();
});

function setupEvents() {
    document.getElementById('add-game-btn').onclick = () => UI.showModal();
    document.querySelector('.close-modal').onclick = () => UI.hideModal();
    document.getElementById('search-button').onclick = () => {
        state.q = UI.elements.searchInput.value;
        state.page = 1;
        loadGames();
    };
    UI.elements.sortSelect.onchange = (e) => {
        state.sort = e.target.value;
        state.page = 1;
        loadGames();
    };
    UI.elements.orderSelect.onchange = (e) => {
        state.order = e.target.value;
        state.page = 1;
        loadGames();
    };
    UI.elements.gameForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('game-id').value;
        const data = {
            title: document.getElementById('title').value,
            genre: document.getElementById('genre').value,
            platform: document.getElementById('platform').value,
            developer: document.getElementById('developer').value,
            release_year: parseInt(document.getElementById('release_year').value) || null,
            description: document.getElementById('description').value,
            image_url: document.getElementById('image_url').value
        };
        try {
            let res = id ? await API.updateGame(id, data) : await API.createGame(data);
            const file = document.getElementById('image-file').files[0];
            if (file) await API.uploadImage(res.id, file);
            UI.hideModal();
            loadGames();
        } catch (err) { alert('Error al guardar'); }
    };
}

async function loadGames() {
    const res = await API.fetchGames(state);
    UI.renderGames(res.data);
    UI.renderPagination(res.page, res.total_pages);
}

function changePage(p) { state.page = p; loadGames(); }

async function handleEdit(id) {
    const g = await API.getGame(id);
    UI.showModal('Editar Juego');
    document.getElementById('game-id').value = g.id;
    document.getElementById('title').value = g.title;
    document.getElementById('genre').value = g.genre;
    document.getElementById('platform').value = g.platform;
    document.getElementById('developer').value = g.developer;
    document.getElementById('release_year').value = g.release_year || '';
    document.getElementById('description').value = g.description;
    document.getElementById('image_url').value = g.image_url;
}

async function handleDelete(id) {
    if (confirm('¿Eliminar?')) {
        await API.deleteGame(id);
        loadGames();
    }
}
