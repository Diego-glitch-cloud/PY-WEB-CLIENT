const state = { page: 1, limit: 12, q: '', sort: 'created_at', order: 'desc' };

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

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

    UI.elements.searchInput.addEventListener('input', debounce((e) => {
        state.q = e.target.value;
        state.page = 1;
        loadGames();
    }, 400));

    document.onkeydown = (e) => {
        if (e.key === 'Escape' && UI.elements.gameModal.style.display === 'block') {
            UI.hideModal();
        }
    };

    UI.elements.gameModal.onclick = (e) => {
        if (e.target === UI.elements.gameModal) UI.hideModal();
    };

    const imgPreview = document.getElementById('image-preview');
    const imgUrlInput = document.getElementById('image_url');
    if (imgUrlInput && imgPreview) {
        imgUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
                imgPreview.src = url;
                imgPreview.style.display = 'block';
            } else {
                imgPreview.style.display = 'none';
                imgPreview.src = '';
            }
        });
        imgPreview.addEventListener('error', () => {
            imgPreview.style.display = 'none';
        });
    }

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

    if (UI.elements.limitSelect) {
        UI.elements.limitSelect.onchange = (e) => {
            state.limit = parseInt(e.target.value);
            state.page = 1;
            loadGames();
        };
    }

    document.getElementById('export-csv-btn').onclick = () => exportCSV();
    document.getElementById('export-xlsx-btn').onclick = () => exportXLSX();

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
        UI.updateResultsCount(res.total);

        Promise.all(
            res.data.map(g => API.getRatings(g.id).catch(() => null))
        ).then(ratings => {
            res.data.forEach((game, i) => {
                if (ratings[i]) {
                    UI.updateStarRating(game.id, ratings[i].average, ratings[i].count);
                }
            });
        });
    } catch (err) {
        UI.showToast('Error al cargar los juegos', 'error');
    }
}

async function handleRate(gameId, score) {
    try {
        const result = await API.createRating(gameId, score);
        UI.updateStarRating(gameId, result.average, result.count);
        UI.showToast('¡Calificación guardada!', 'success');
    } catch (err) {
        UI.showToast('Error al guardar la calificación', 'error');
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
        
        const urlInput = document.getElementById('image_url');
        urlInput.value = g.image_url || '';
        urlInput.dispatchEvent(new Event('input'));
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

async function exportCSV() {
    UI.showToast('Preparando CSV...', 'success');
    try {
        const res = await API.fetchGames({ ...state, limit: 9999, page: 1 });
        const games = res.data;
        
        const headers = ['ID', 'Título', 'Género', 'Plataforma', 'Desarrollador', 'Año', 'Descripción'];
        const csvRows = [headers.join(',')];

        for (const g of games) {
            const row = [
                g.id,
                `"${(g.title || '').replace(/"/g, '""')}"`,
                `"${(g.genre || '').replace(/"/g, '""')}"`,
                `"${(g.platform || '').replace(/"/g, '""')}"`,
                `"${(g.developer || '').replace(/"/g, '""')}"`,
                g.release_year || '',
                `"${(g.description || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'videojuegos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        UI.showToast('Error al exportar CSV', 'error');
    }
}

async function exportXLSX() {
    UI.showToast('Generando Excel...', 'success');
    try {
        const res = await API.fetchGames({ ...state, limit: 9999, page: 1 });
        const games = res.data;

        const xmlTemplate = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Videojuegos">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Título</Data></Cell>
    <Cell><Data ss:Type="String">Género</Data></Cell>
    <Cell><Data ss:Type="String">Plataforma</Data></Cell>
    <Cell><Data ss:Type="String">Desarrollador</Data></Cell>
    <Cell><Data ss:Type="String">Año</Data></Cell>
   </Row>
   ${games.map(g => `
   <Row>
    <Cell><Data ss:Type="String">${escapeXML(g.title || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(g.genre || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(g.platform || '')}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXML(g.developer || '')}</Data></Cell>
    <Cell><Data ss:Type="Number">${g.release_year || 0}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

        const blob = new Blob([xmlTemplate], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'videojuegos.xls');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        UI.showToast('Error al exportar Excel', 'error');
    }
}

function escapeXML(str) {
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
