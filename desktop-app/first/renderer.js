const player = document.getElementById('player');
const playlist = document.getElementById('playlist');

// Bu yerda keyinroq musiqa fayllarini qo‘shish logikasini yozamiz
const { ipcRenderer } = require('electron');