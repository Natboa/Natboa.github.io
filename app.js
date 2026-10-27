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
