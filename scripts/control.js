// --- Elementos DOM (Controlador) ---
const countdownEl = document.getElementById('countdown');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const totalTimeInput = document.getElementById('totalTimeInput');
const setTimeBtn = document.getElementById('setTimeBtn');
const openDisplayBtn = document.getElementById('openDisplayBtn');
const expedienteE1 = document.getElementById('expediente');
const setPeqExp = document.getElementById('setPeqExp');
const setGrndExp = document.getElementById('setGrndExp');
const setTempoExtra = document.getElementById('setTempoExtra');
const setPronunExp = document.getElementById('setPronunExp');

// --- Chaves do localStorage ---
const STORAGE_TIME_LEFT = 'plenario_timeLeft';
const STORAGE_TOTAL_TIME = 'plenario_totalTime';
const STORAGE_IS_RUNNING = 'plenario_isRunning';
const STORAGE_LAST_SYNC = 'plenario_lastSync';
const STORAGE_EXPEDIENTE = 'plenario_expediente';

// --- Variáveis de Controle ---
let totalTimeSeconds = 300; 
let timeLeft = totalTimeSeconds;
let isRunning = false;
let tempo = 0;
let expediente = 'Tribuna Livre'

// --- Funções Auxiliares ---

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateDisplay() {
    countdownEl.textContent = formatTime(timeLeft);
    expedienteE1.textContent = expediente;
}

// --- Sincronização com Display ---

/**
 * Salva o estado atual no localStorage.
 */
function saveState() {
    localStorage.setItem(STORAGE_TOTAL_TIME, totalTimeSeconds);
    localStorage.setItem(STORAGE_TIME_LEFT, timeLeft);
    localStorage.setItem(STORAGE_IS_RUNNING, isRunning);
    // Marca o tempo do último comando para o display saber que houve mudança
    localStorage.setItem(STORAGE_LAST_SYNC, Date.now()); 
    localStorage.setItem(STORAGE_EXPEDIENTE, expediente)
}

/**
 * Carrega o estado inicial do localStorage.
 */
function loadState() {
    const storedTotal = localStorage.getItem(STORAGE_TOTAL_TIME);
    const storedLeft = localStorage.getItem(STORAGE_TIME_LEFT);
    const storedRunning = localStorage.getItem(STORAGE_IS_RUNNING);

    if (storedTotal) {
        totalTimeSeconds = parseInt(storedTotal, 10);
        totalTimeInput.value = totalTimeSeconds / 60; 
    }
    if (storedLeft !== null) {
        timeLeft = parseInt(storedLeft, 10);
    } else {
        timeLeft = totalTimeSeconds;
    }
    if (storedRunning !== null) {
        isRunning = storedRunning === 'true';
    }

    updateButtonText();
    updateDisplay();
}

function updateButtonText() {
    if (timeLeft <= 0 && totalTimeSeconds > 0) {
        startStopBtn.textContent = 'Tempo Esgotado';
        startStopBtn.disabled = true;
    } else if (isRunning) {
        startStopBtn.textContent = 'Pausar';
        startStopBtn.disabled = false;
    } else {
        startStopBtn.textContent = 'Iniciar (Barra de Espaço)';
        startStopBtn.disabled = false;
    }
}

// --- Manipuladores de Evento ---

setTimeBtn.addEventListener('click', () => {
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = 'Tribuna livre' 
        
        saveState();
        updateButtonText();
        updateDisplay();
});

setPeqExp.addEventListener('click', () => {
    mudarValor(3);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Pequeno Expediente"
        
        saveState();
        updateButtonText();
        updateDisplay();
});

setGrndExp.addEventListener('click', () => {
    mudarValor(5);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Grande Expediente"
        
        saveState();
        updateButtonText();
        updateDisplay();
});

setPronunExp.addEventListener('click', () => {
    mudarValor(10);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Pronunciamento"
        
        saveState();
        updateButtonText();
        updateDisplay();
});

setTempoExtra.addEventListener('click', () => {
    mudarValor(0.5);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Tempo Extra"
        
        saveState();
        updateButtonText();
        updateDisplay();
});

function toggleTimer() {
    if (startStopBtn.disabled) return;

    isRunning = !isRunning;

    // Se estiver iniciando, garante que o tempo restante seja o tempo total se for zero
    if (isRunning && timeLeft <= 0) {
        timeLeft = totalTimeSeconds;
    }

    saveState();
    updateButtonText();
}

resetBtn.addEventListener('click', () => {
    isRunning = false;
    timeLeft = totalTimeSeconds;
    
    saveState();
    updateButtonText();
    updateDisplay();
});

openDisplayBtn.addEventListener('click', () => {
    window.open('display.html', '_blank');
});

startStopBtn.addEventListener('click', toggleTimer); 

// ⌨️ Manipulador de Eventos de Teclado (para o controle)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); 
        const activeElement = document.activeElement;
        // Permite o atalho apenas se não estiver editando o tempo
        if (activeElement !== totalTimeInput) {
            toggleTimer();
        }
    }
    if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        resetBtn.click();
    }
});

// --- função para alterar o valor do campo conforme expediente
function mudarValor(tempo) {
    var inputElemento = document.getElementById('totalTimeInput');
    inputElemento.value = tempo;
}

function playSiren(tempo) {
    sirenSound.currentTime = 0;
    sirenSound.play();
    setTimeout(() => {
        if (!sirenSound.paused) {
            sirenSound.pause();
        }
    }, tempo*1000);
}

// --- Inicialização ---
loadState();