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
const setClockMode = document.getElementById('setClockMode');

// --- Chaves do localStorage ---
const STORAGE_TIME_LEFT = 'plenario_timeLeft';
const STORAGE_TOTAL_TIME = 'plenario_totalTime';
const STORAGE_IS_RUNNING = 'plenario_isRunning';
const STORAGE_LAST_SYNC = 'plenario_lastSync';
const STORAGE_EXPEDIENTE = 'plenario_expediente';
const STORAGE_CLOCK_MODE = 'plenario_clockMode';

// --- Variáveis de Controle ---
let totalTimeSeconds = 300; 
let timeLeft = totalTimeSeconds;
let isRunning = false;
let expediente = 'Tribuna Livre';
let clockMode = false;

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
    localStorage.setItem(STORAGE_LAST_SYNC, Date.now()); 
    localStorage.setItem(STORAGE_EXPEDIENTE, expediente);
    localStorage.setItem(STORAGE_CLOCK_MODE, clockMode);
}

/**
 * Carrega o estado inicial do localStorage.
 */
function loadState() {
    const storedTotal = localStorage.getItem(STORAGE_TOTAL_TIME);
    const storedLeft = localStorage.getItem(STORAGE_TIME_LEFT);
    const storedRunning = localStorage.getItem(STORAGE_IS_RUNNING);
    const storedClockMode = localStorage.getItem(STORAGE_CLOCK_MODE);
    const storedExpediente = localStorage.getItem(STORAGE_EXPEDIENTE);

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
    if (storedClockMode !== null) {
        clockMode = storedClockMode === 'true';
    }
    if (storedExpediente !== null) {
        expediente = storedExpediente;
    } else {
        expediente = 'Tribuna Livre';
    }

    updateButtonText();
    updateDisplay();
    updateClockModeButton();
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

function updateClockModeButton() {
    if (clockMode) {
        setClockMode.textContent = 'Cronômetro';
        setClockMode.classList.add('active-mode');
    } else {
        setClockMode.textContent = 'Relógio';
        setClockMode.classList.remove('active-mode');
    }
}

// --- Manipuladores de Evento ---

setClockMode.addEventListener('click', () => {
    clockMode = !clockMode;
    
    // Força a parada do cronômetro ao entrar no modo Relógio
    if (clockMode) {
        isRunning = false; 
    }
    
    updateClockModeButton();
    updateButtonText();
    saveState();
});

setTimeBtn.addEventListener('click', () => {
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = 'Tribuna livre'; 
        clockMode = false; // DESLIGA O RELÓGIO
        
        saveState();
        updateButtonText();
        updateDisplay();
        updateClockModeButton();
});

setPeqExp.addEventListener('click', () => {
    mudarValor(3);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Pequeno Expediente";
        clockMode = false; // DESLIGA O RELÓGIO
        
        saveState();
        updateButtonText();
        updateDisplay();
        updateClockModeButton();
});

setGrndExp.addEventListener('click', () => {
    mudarValor(5);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Grande Expediente";
        clockMode = false; 
        
        saveState();
        updateButtonText();
        updateDisplay();
        updateClockModeButton();
});

setPronunExp.addEventListener('click', () => {
    mudarValor(10);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Pronunciamento";
        clockMode = false; 
        
        saveState();
        updateButtonText();
        updateDisplay();
        updateClockModeButton();
});

setTempoExtra.addEventListener('click', () => {
    mudarValor(0.5);
    const minutes = parseFloat(totalTimeInput.value, 10);
        totalTimeSeconds = minutes * 60;
        timeLeft = totalTimeSeconds;
        isRunning = false;
        expediente = "Tempo Extra";
        clockMode = false; 
        
        saveState();
        updateButtonText();
        updateDisplay();
        updateClockModeButton();
});

function toggleTimer() {
    if (startStopBtn.disabled) return;
    
    // Ao iniciar o timer, garante que o modo relógio está desativado
    if (!isRunning) {
        clockMode = false;
        updateClockModeButton();
    }

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
    clockMode = false; // ZERAR também desliga o relógio
    
    saveState();
    updateButtonText();
    updateDisplay();
    updateClockModeButton();
});

openDisplayBtn.addEventListener('click', () => {
    window.open('display.html', '_blank', 'fullscreen="yes"');
});

startStopBtn.addEventListener('click', toggleTimer); 

// ⌨️ Manipulador de Eventos de Teclado (para o controle)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); 
        const activeElement = document.activeElement;
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