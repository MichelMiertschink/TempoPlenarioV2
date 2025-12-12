// --- Elementos DOM (Display) ---
const countdownEl = document.getElementById('countdown');
const currentClockEl = document.getElementById('currentClock');
const mainContainer = document.getElementById('mainContainer');
const headerStatusEl = document.getElementById('headerStatus');
const sirenSound = document.getElementById('sirenSound');

// --- Chaves do localStorage ---
const STORAGE_TIME_LEFT = 'plenario_timeLeft';
const STORAGE_TOTAL_TIME = 'plenario_totalTime';
const STORAGE_IS_RUNNING = 'plenario_isRunning';
const STORAGE_LAST_SYNC = 'plenario_lastSync';
const STORAGE_EXPEDIENTE = 'plenario_expediente';

// --- Variáveis de Controle ---
let totalTimeSeconds = 0; 
let timeLeft = 0;
let timerInterval = null;
let clockInterval = null;
let oneMinuteWarningIssued = false;
let lastSyncedTime = 0;
let expediente = 'AGUARDANDO';

// --- Funções Auxiliares ---

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
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

function startWarning() {
    countdownEl.classList.add('blinking');
    playSiren(1);
    oneMinuteWarningIssued = true;
}

function stopWarning() {
    countdownEl.classList.remove('blinking');
}

/**
 * Atualiza o display do cronômetro E o status do cabeçalho.
 */
function updateDisplay() {
    countdownEl.textContent = formatTime(timeLeft);
    
    // Lógica de status no Header
    if (timeLeft <= 0) {
        // Tempo Esgotado
        headerStatusEl.textContent = 'TEMPO ESGOTADO';
        headerStatusEl.style.color = '#e74c3c'; // Vermelho
    } else if (!timerInterval) {
        // Pausado (ou Aguardando)
        headerStatusEl.textContent = 'PAUSADO';
        headerStatusEl.style.color = '#f1c40f'; // Amarelo
    } else {
        // Em Curso
        headerStatusEl.textContent = expediente;
        headerStatusEl.style.color = '#2ecc71'; // Verde
    }
}

// --- Lógica do Cronômetro (Tick) ---

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();

        // 🚨 Alerta de 1 minuto restante 🚨
        if (timeLeft === 60 && !oneMinuteWarningIssued) {
            startWarning();
        }

        // Fim do tempo
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            stopWarning(); 
            updateDisplay(); 
        }

    } else if (timeLeft <= 0 && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        stopWarning(); 
        updateDisplay(); 
    }
}

function startTimer() {
    if (timerInterval) return; 
    if (timeLeft <= 0) return; 
    
    timerInterval = setInterval(tick, 1000);
    if (timeLeft <= 60 && oneMinuteWarningIssued) {
        countdownEl.classList.add('blinking');
    }
    updateDisplay();
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    stopWarning();
    updateDisplay();
}

// --- Sincronização e Relógio ---

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentClockEl.textContent = `${hours}:${minutes}:${seconds}`;
}

/**
 * Verifica o localStorage para comandos do controle.
 */
function syncStateFromControl() {
    const newTotal = parseInt(localStorage.getItem(STORAGE_TOTAL_TIME) || 0, 10);
    const newLeft = parseInt(localStorage.getItem(STORAGE_TIME_LEFT) || 0, 10);
    const newRunning = localStorage.getItem(STORAGE_IS_RUNNING) === 'true';
    const lastSync = parseInt(localStorage.getItem(STORAGE_LAST_SYNC) || 0, 10);
    
    
    // Verifica se houve uma alteração real no controle
    if (lastSync > lastSyncedTime || newTotal !== totalTimeSeconds) {
        
        // Se o tempo total mudou, reseta o aviso de 1 minuto
        if (newTotal !== totalTimeSeconds) {
            oneMinuteWarningIssued = false;
        }

        totalTimeSeconds = newTotal;
        timeLeft = newLeft;
        lastSyncedTime = lastSync;
        expediente = localStorage.getItem(STORAGE_EXPEDIENTE);

        // Lógica de Iniciar/Parar com base no controle
        if (newRunning) {
            startTimer();
        } else {
            stopTimer();
            // Reseta a flag de aviso se foi resetado ou parado
            if (timeLeft === totalTimeSeconds) {
                 oneMinuteWarningIssued = false;
            }
        }
        updateDisplay();
    }
}

// --- Inicialização ---

window.onload = function() {
    // 1. Inicia o relógio de hora atual
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
    
    // 2. Tenta carregar o estado inicial
    syncStateFromControl();
    
    // 3. Configura o listener para monitorar mudanças no localStorage
    window.addEventListener('storage', syncStateFromControl);
    
    // 4. Fallback de sincronização a cada 5 segundos
    setInterval(syncStateFromControl, 5000);

    // 5. Exibe o status inicial
    if (localStorage.getItem(STORAGE_LAST_SYNC) === null) {
        countdownEl.textContent = formatTime(300); 
    }
};