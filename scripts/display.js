// --- Elementos DOM (Display) ---
const countdownEl = document.getElementById('countdown');
const currentClockEl = document.getElementById('currentClock');
const mainContainer = document.getElementById('mainContainer');
const headerStatusEl = document.getElementById('headerStatus');
const sirenSound = document.getElementById('sirenSound');
const bigClockEl = document.getElementById('bigClock'); 

// --- Chaves do localStorage ---
const STORAGE_TIME_LEFT = 'plenario_timeLeft';
const STORAGE_TOTAL_TIME = 'plenario_totalTime';
const STORAGE_IS_RUNNING = 'plenario_isRunning';
const STORAGE_LAST_SYNC = 'plenario_lastSync';
const STORAGE_EXPEDIENTE = 'plenario_expediente';
const STORAGE_CLOCK_MODE = 'plenario_clockMode'; 

// --- Variáveis de Controle ---
let totalTimeSeconds = 0; 
let timeLeft = 0;
let timerInterval = null;
let clockInterval = null;
let oneMinuteWarningIssued = false;
let lastSyncedTime = 0;
let expediente = 'AGUARDANDO';
let clockMode = false; 

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
    playSiren(1.5);
    oneMinuteWarningIssued = true;
}

function stopWarning() {
    countdownEl.classList.remove('blinking');
}

/**
 * Função para atualizar a exibição do relógio grande.
 */
function updateBigClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    bigClockEl.textContent = `${hours}:${minutes}:${seconds}`;
}

/**
 * Alterna a visibilidade entre cronômetro e relógio grande.
 */
function toggleDisplayMode() {
    if (clockMode) {
        countdownEl.classList.add('hidden');
        bigClockEl.classList.remove('hidden');
        updateBigClock(); 
    } else {
        countdownEl.classList.remove('hidden');
        bigClockEl.classList.add('hidden');
    }
}

/**
 * Atualiza o display do cronômetro E o status do cabeçalho.
 */
function updateDisplay() {
    // 1. Alterna o modo de exibição principal
    toggleDisplayMode(); 

    // 2. Se for modo relógio, apenas atualiza o cabeçalho e sai
    if (clockMode) {
        headerStatusEl.textContent = 'HORÁRIO DE BRASÍLIA';
        headerStatusEl.style.color = '#3498db'; // Azul para o relógio
        return; 
    }

    // 3. Atualiza o cronômetro (só visível se clockMode for false)
    countdownEl.textContent = formatTime(timeLeft);
    
    // 4. Lógica de status no Header e cor do cronômetro
    if (timeLeft <= 0) {
        headerStatusEl.textContent = 'TEMPO ESGOTADO';
        // countdownEl.style.color = '#e74c3c'; // Vermelho
        countdownEl.style.color = '#fff'; // Branco
    } else if (!timerInterval) {
        headerStatusEl.textContent = expediente;
        headerStatusEl.style.color = '#f1c40f'; // Amarelo
        countdownEl.style.color = '#f1c40f';
    } else {
        headerStatusEl.textContent = expediente;
        headerStatusEl.style.color = '#2ecc71'; // Verde
        countdownEl.style.color = '#2ecc71';
    }
}

// --- Lógica do Cronômetro (Tick) ---

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 60 && !oneMinuteWarningIssued) {
            startWarning();
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            // stopWarning(); 
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
    
    // Atualiza o relógio grande também, se estiver visível
    if (clockMode) {
        updateBigClock();
    }
}


/**
 * Verifica o localStorage para comandos do controle.
 */
function syncStateFromControl() {
    const newTotal = parseInt(localStorage.getItem(STORAGE_TOTAL_TIME) || 0, 10);
    const newLeft = parseInt(localStorage.getItem(STORAGE_TIME_LEFT) || 0, 10);
    const newRunning = localStorage.getItem(STORAGE_IS_RUNNING) === 'true';
    const lastSync = parseInt(localStorage.getItem(STORAGE_LAST_SYNC) || 0, 10);
    const newClockMode = localStorage.getItem(STORAGE_CLOCK_MODE) === 'true'; 
    
    
    // Verifica se houve uma alteração real no controle
    if (lastSync > lastSyncedTime || newTotal !== totalTimeSeconds || newClockMode !== clockMode) {
        
        // Se o modo de exibição mudou
        clockMode = newClockMode;

        // Se o tempo total mudou, reseta o aviso de 1 minuto
        if (newTotal !== totalTimeSeconds) {
            oneMinuteWarningIssued = false;
        }

        totalTimeSeconds = newTotal;
        timeLeft = newLeft;
        lastSyncedTime = lastSync;
        expediente = localStorage.getItem(STORAGE_EXPEDIENTE) || 'AGUARDANDO';

        // Lógica de Iniciar/Parar com base no controle
        if (newRunning && !clockMode) { // SÓ INICIA SE NÃO ESTIVER EM MODO RELÓGIO
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
    // 1. Inicia o relógio de hora atual (pequeno)
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