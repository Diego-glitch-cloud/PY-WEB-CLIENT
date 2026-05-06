const API = {
    async fetchGames(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${CONFIG.API_URL}/games?${query}`);
        if (!response.ok) throw new Error('Error al obtener los juegos');
        return await response.json();
    },
    async getGame(id) {
        const response = await fetch(`${CONFIG.API_URL}/games/${id}`);
        if (!response.ok) throw new Error('Juego no encontrado');
        return await response.json();
    },
    async createGame(gameData) {
        const response = await fetch(`${CONFIG.API_URL}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        if (!response.ok) throw await response.json();
        return await response.json();
    },
    async updateGame(id, gameData) {
        const response = await fetch(`${CONFIG.API_URL}/games/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        });
        if (!response.ok) throw await response.json();
        return await response.json();
    },
    async deleteGame(id) {
        const response = await fetch(`${CONFIG.API_URL}/games/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        return true;
    },
    async uploadImage(id, file) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${CONFIG.API_URL}/games/${id}/image`, { method: 'POST', body: formData });
        return await response.json();
    },
    async getRatings(id) {
        const response = await fetch(`${CONFIG.API_URL}/games/${id}/rating`);
        if (!response.ok) throw new Error('Error al obtener ratings');
        return await response.json();
    },
    async createRating(id, score) {
        const response = await fetch(`${CONFIG.API_URL}/games/${id}/rating`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score })
        });
        if (!response.ok) throw await response.json();
        return await response.json();
    }
};
