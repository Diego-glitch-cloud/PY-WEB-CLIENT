const state = { page: 1, limit: 12, q: '', sort: 'created_at', order: 'desc' };

document.addEventListener('DOMContentLoaded', () => {
    loadGames();
    setupEvents();
});

function setupEvents() {
    document.getElementById('add-game-btn').onclick = () => {
        UI.hideModal();
        UI.showModal();
    };
    document.querySelector('.close-modal').onclick = () => UI.hideModal();
    
    document.getElementById('search-button').onclick = () => {
        state.q = UI.elements.searchInput.value;
        state.page = 1;
        loadGames();
    };

    UI.elements.searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            state.q = UI.elements.searchInput.value;
            state.page = 1;
            loadGames();
        }
    };

    document.onkeydown = (e) => {
        if (e.key === 'Escape' && UI.elements.gameModal.style.display === 'block') {
            UI.hideModal();
        }
    };

    UI.elements.gameModal.onclick = (e) => {
        if (e.target === UI.elements.gameModal) UI.hideModal();
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
        UI.clearErrors();
        
        const submitBtn = UI.elements.gameForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Guardando...';

        const id = document.getElementById('game-id').value;
        const releaseYearValue = document.getElementById('release_year').value;
        const data = {
            title: document.getElementById('title').value,
            genre: document.getElementById('genre').value,
            platform: document.getElementById('platform').value,
            developer: document.getElementById('developer').value,
            release_year: releaseYearValue.trim() === '' ? null : parseInt(releaseYearValue),
            description: document.getElementById('description').value,
            image_url: document.getElementById('image_url').value
        };

        try {
            let res = id ? await API.updateGame(id, data) : await API.createGame(data);
            const file = document.getElementById('image-file').files[0];
            if (file) await API.uploadImage(res.id, file);
            
            UI.hideModal();
            UI.showToast(id ? 'Juego actualizado con éxito' : 'Juego creado con éxito');
            loadGames();
        } catch (err) { 
            if (err.field) {
                UI.showFieldError(err.field, err.message);
            } else {
                UI.showToast(err.message || 'Error al guardar el juego', 'error');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    };
}

async function loadGames() {
    UI.showLoading();
    try {
        const res = await API.fetchGames(state);
        UI.renderGames(res.data);
        UI.renderPagination(res.page, res.total_pages);
    } catch (err) {
        UI.showToast('Error al cargar los juegos', 'error');
    }
}

function changePage(p) { 
    state.page = p; 
    loadGames(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleEdit(id) {
    try {
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
    } catch (err) {
        UI.showToast('Error al cargar el detalle del juego', 'error');
    }
}

async function handleDelete(id) {
    const confirmed = await UI.showConfirm(
        '¿Eliminar videojuego?', 
        'Esta acción no se puede deshacer y el juego desaparecerá permanentemente.'
    );
    
    if (confirmed) {
        try {
            await API.deleteGame(id);
            UI.showToast('Juego eliminado correctamente');
            loadGames();
        } catch (err) {
            UI.showToast('Error al eliminar el juego', 'error');
        }
    }
}
