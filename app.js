// Appearance is progressive enhancement: CSS follows the system without JS.
const appearance = document.querySelector('#appearance');
const validThemes = ['system', 'light', 'dark'];
try {
  const saved = localStorage.getItem('natboa-theme');
  if (validThemes.includes(saved)) appearance.value = saved;
} catch { /* Storage may be unavailable in private or restricted contexts. */ }
document.querySelector('.appearance').hidden = false;
appearance.addEventListener('change', () => {
  const mode = appearance.value;
  if (mode === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  try {
    if (mode === 'system') localStorage.removeItem('natboa-theme');
    else localStorage.setItem('natboa-theme', mode);
  } catch {}
});

// Load the larger animation only after an explicit click. The still keeps the
// same dimensions, preventing layout shifts and providing a real stop control.
const poster = document.querySelector('#terrain-animation');
const playButton = document.querySelector('#play-terrain');
const posterDetails = document.querySelector('#terrain-preview');
const playbackStatus = document.querySelector('#playback-status');
const still = poster.getAttribute('src');
let playbackRequest = 0;
let playing = false;
playButton.hidden = false;

function stopPoster() {
  playbackRequest += 1;
  playing = false;
  poster.src = still;
  poster.alt = 'Lake Titicaca journey shown as a finished terrain poster.';
  playButton.textContent = 'Play transformation';
  playButton.setAttribute('aria-pressed', 'false');
  playButton.disabled = false;
  playbackStatus.textContent = '';
}

playButton.addEventListener('click', async () => {
  if (playing) return stopPoster();
  const request = ++playbackRequest;
  playButton.disabled = true;
  playButton.textContent = 'Loading…';
  const animation = new Image();
  animation.src = 'assets/terrain-process.gif';
  try {
    await animation.decode();
    if (request !== playbackRequest || !posterDetails.open || document.hidden) return;
    poster.src = animation.src;
    poster.alt = 'The actual Google map with trip pins and route becomes satellite imagery, then the finished three-dimensional terrain poster.';
    playing = true;
    playButton.textContent = 'Stop animation';
    playButton.setAttribute('aria-pressed', 'true');
  } catch {
    if (request === playbackRequest) {
      stopPoster();
      playbackStatus.textContent = 'The animation could not load. You can still explore the poster maker using the link above.';
    }
  } finally {
    if (request === playbackRequest) playButton.disabled = false;
  }
});
posterDetails.addEventListener('toggle', () => { if (!posterDetails.open) stopPoster(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPoster(); });
