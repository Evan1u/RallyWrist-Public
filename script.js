const videos = [...document.querySelectorAll('[data-native-video]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const manuallyPaused = new Set();
function syncButton(video) {
  const button = document.querySelector(`[data-video="${video.id}"]`);
  button.textContent = video.paused ? '播放' : '暂停';
  button.setAttribute('aria-label', `${video.paused ? '播放' : '暂停'}${video.id === 'home-video' ? '首页' : '计分'}演示`);
}
for (const video of videos) {
  // Respect system motion preferences before the media starts.
  if (reducedMotion.matches) { video.autoplay = false; video.pause(); manuallyPaused.add(video); }
  video.addEventListener('play', () => syncButton(video));
  video.addEventListener('pause', () => syncButton(video));
  video.addEventListener('error', () => { video.controls = true; syncButton(video); });
  document.querySelector(`[data-video="${video.id}"]`).addEventListener('click', async () => {
    if (video.paused) {
      try { await video.play(); manuallyPaused.delete(video); } catch { video.controls = true; }
    } else { manuallyPaused.add(video); video.pause(); }
    syncButton(video);
  });
  syncButton(video);
}
const mediaObserver = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (isIntersecting && !document.hidden && !manuallyPaused.has(target)) target.play().catch(() => syncButton(target));
    else target.pause();
  }
}, { threshold: 0.1 });
videos.forEach(video => mediaObserver.observe(video));
document.addEventListener('visibilitychange', () => {
  videos.forEach(video => {
    const rect = video.getBoundingClientRect();
    if (document.hidden) video.pause();
    else if (!manuallyPaused.has(video) && rect.bottom > 0 && rect.top < innerHeight) video.play().catch(() => syncButton(video));
  });
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) videos.forEach(video => { manuallyPaused.add(video); video.pause(); });
});
for (const button of document.querySelectorAll('[data-demo]')) {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const doubles = button.dataset.demo === 'doubles';
    document.querySelectorAll('[data-demo]').forEach(tab => {
      tab.classList.toggle('selected', tab === button);
      tab.setAttribute('aria-pressed', String(tab === button));
    });
    const video = document.getElementById('score-video');
    video.poster = `assets/latest/${doubles ? 'doubles' : 'singles'}-10.png`;
    video.querySelector('source').src = `assets/latest/${button.dataset.demo}.mp4`;
    video.setAttribute('aria-label', doubles ? '双打加减分与站位变化原生录屏' : '单打加减分与发球标记变化原生录屏');
    const rotationHeading = document.querySelector('.score-chapter:nth-child(2) h2');
    const rotationDescription = document.querySelector('.score-chapter:nth-child(2) p');
    if (rotationHeading) rotationHeading.firstChild.textContent = doubles ? '双打站位，' : '发球方位，';
    if (rotationDescription) rotationDescription.textContent = doubles ? '发球、接发，一眼清楚。' : '发球方位，一眼清楚。';
    video.load();
    if (!manuallyPaused.has(video)) video.play().catch(() => syncButton(video));
  });
}
