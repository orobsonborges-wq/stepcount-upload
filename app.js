const screens = {
  upload: document.querySelector('#screen-upload'),
  config: document.querySelector('#screen-config'),
  processing: document.querySelector('#screen-processing'),
  result: document.querySelector('#screen-result'),
};

const videoInput = document.querySelector('#video-input');
const dropZone = document.querySelector('#drop-zone');
const videoPreview = document.querySelector('#video-preview');
const mockScene = document.querySelector('#mock-scene');
const configFileName = document.querySelector('#config-file-name');
const configDuration = document.querySelector('#config-duration');
const scrubberTime = document.querySelector('#scrubber-time');
const stagePlay = document.querySelector('#stage-play');
const stepLine = document.querySelector('#step-line');
const toast = document.querySelector('#toast');
const toastText = document.querySelector('#toast-text');
const helpModal = document.querySelector('#help-modal');
const scoreNumber = document.querySelector('#score-number');

let uploadedUrl = '';
let currentFile = null;
let progressTimer = null;
let dragState = null;
let toastTimer = null;

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('screen-active'));
  screens[name].classList.add('screen-active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function openConfig(file) {
  currentFile = file || null;
  if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
  uploadedUrl = '';
  if (file) {
    uploadedUrl = URL.createObjectURL(file);
    videoPreview.src = uploadedUrl;
    videoPreview.classList.add('visible');
    mockScene.style.display = 'none';
    configFileName.textContent = file.name;
    videoPreview.onloadedmetadata = () => {
      configDuration.textContent = formatDuration(videoPreview.duration);
      scrubberTime.textContent = `00:00 / ${formatDuration(videoPreview.duration)}`;
    };
  } else {
    videoPreview.removeAttribute('src');
    videoPreview.classList.remove('visible');
    mockScene.style.display = 'block';
    configFileName.textContent = 'vídeo_demonstrativo.mp4';
    configDuration.textContent = '01:42';
    scrubberTime.textContent = '00:00 / 01:42';
  }
  showScreen('config');
}

function resetApp() {
  window.clearInterval(progressTimer);
  if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
  uploadedUrl = '';
  currentFile = null;
  videoInput.value = '';
  videoPreview.pause();
  videoPreview.removeAttribute('src');
  videoPreview.classList.remove('visible');
  mockScene.style.display = 'block';
  stagePlay.classList.remove('is-playing');
  document.querySelector('#progress-fill').style.width = '0%';
  document.querySelector('#progress-percent').textContent = '0%';
  showScreen('upload');
}

function startAnalysis() {
  showScreen('processing');
  let progress = 0;
  const progressFill = document.querySelector('#progress-fill');
  const progressPercent = document.querySelector('#progress-percent');
  const progressLabel = document.querySelector('#progress-label');
  const frameNumber = document.querySelector('#frame-number');
  const processingTime = document.querySelector('#processing-time');
  const labels = [
    [0, 'Preparando vídeo...'],
    [18, 'Localizando a pessoa...'],
    [39, 'Mapeando pontos de pose...'],
    [62, 'Validando subidas...'],
    [82, 'Removendo movimentos incompletos...'],
    [96, 'Consolidando eventos...'],
  ];
  window.clearInterval(progressTimer);
  progressTimer = window.setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 3;
    if (progress >= 100) {
      progress = 100;
      window.clearInterval(progressTimer);
    }
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;
    frameNumber.textContent = Math.floor(48 + progress * 10.2).toString().padStart(4, '0');
    const label = [...labels].reverse().find(([threshold]) => progress >= threshold);
    if (label) progressLabel.textContent = label[1];
    processingTime.textContent = progress >= 93 ? 'finalizando...' : `~ ${Math.max(4, Math.ceil((100 - progress) * .45))}s restantes`;
    if (progress === 100) {
      window.setTimeout(() => showScreen('result'), 520);
    }
  }, 260);
}

function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showToast('Escolha um arquivo de vídeo para continuar.');
    return;
  }
  if (file.size > 200 * 1024 * 1024) {
    showToast('O arquivo ultrapassa o limite de 200 MB.');
    return;
  }
  openConfig(file);
}

videoInput.addEventListener('change', (event) => handleFile(event.target.files[0]));
['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', (event) => handleFile(event.dataTransfer.files[0]));
dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    videoInput.click();
  }
});

function setLinePosition(clientY) {
  const rect = document.querySelector('#video-stage').getBoundingClientRect();
  const percentage = Math.min(90, Math.max(25, ((clientY - rect.top) / rect.height) * 100));
  stepLine.style.top = `${percentage}%`;
}

document.querySelector('.line-handle').addEventListener('pointerdown', (event) => {
  dragState = true;
  event.currentTarget.setPointerCapture(event.pointerId);
  event.preventDefault();
});
document.querySelector('#video-stage').addEventListener('pointermove', (event) => {
  if (dragState) setLinePosition(event.clientY);
});
document.querySelector('#video-stage').addEventListener('pointerup', () => { dragState = false; });
document.querySelector('#video-stage').addEventListener('pointercancel', () => { dragState = false; });

document.querySelector('[data-action="toggle-video"]').addEventListener('click', () => {
  if (!videoPreview.classList.contains('visible')) {
    showToast('Envie um vídeo para reproduzir a prévia.');
    return;
  }
  if (videoPreview.paused) {
    videoPreview.play();
    stagePlay.classList.add('is-playing');
  } else {
    videoPreview.pause();
    stagePlay.classList.remove('is-playing');
  }
});
videoPreview.addEventListener('ended', () => stagePlay.classList.remove('is-playing'));
videoPreview.addEventListener('timeupdate', () => {
  if (!videoPreview.duration) return;
  const pct = videoPreview.currentTime / videoPreview.duration * 100;
  document.querySelector('.scrubber-fill').style.width = `${pct}%`;
  document.querySelector('.scrubber-thumb').style.left = `${pct}%`;
  scrubberTime.textContent = `${formatDuration(videoPreview.currentTime)} / ${formatDuration(videoPreview.duration)}`;
});

document.addEventListener('click', (event) => {
  const actionElement = event.target.closest('[data-action]');
  if (!actionElement) return;
  const action = actionElement.dataset.action;
  if (action === 'reset' || action === 'back') resetApp();
  if (action === 'start-analysis') startAnalysis();
  if (action === 'demo-config') {
    openConfig();
    showToast('Exemplo carregado. Ajuste a borda do degrau.');
  }
  if (action === 'open-help') {
    helpModal.classList.add('open');
    helpModal.setAttribute('aria-hidden', 'false');
  }
  if (action === 'close-help') {
    helpModal.classList.remove('open');
    helpModal.setAttribute('aria-hidden', 'true');
  }
  if (action === 'open-profile') showToast('Perfil e histórico estarão disponíveis na próxima versão.');
  if (action === 'toggle-protocol') showToast('Protocolo padrão: subida e retorno completos.');
  if (action === 'toggle-events') showToast('Todos os 32 eventos estão marcados no vídeo.');
  if (action === 'export') showToast('Relatório preparado para exportação.');
  if (action === 'save-result') showToast('Resultado salvo neste dispositivo.');
});

helpModal.addEventListener('click', (event) => {
  if (event.target === helpModal) {
    helpModal.classList.remove('open');
    helpModal.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    helpModal.classList.remove('open');
    helpModal.setAttribute('aria-hidden', 'true');
  }
});

// A small review interaction makes the result card feel testable in the prototype.
document.querySelector('.event-timeline').addEventListener('click', (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const pct = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
  const marker = document.createElement('span');
  marker.className = 'event-marker';
  marker.style.left = `${pct}%`;
  marker.title = 'Evento adicionado';
  event.currentTarget.appendChild(marker);
  const current = Number(scoreNumber.textContent) || 32;
  scoreNumber.textContent = current + 1;
  showToast('Evento adicionado à revisão.');
});
