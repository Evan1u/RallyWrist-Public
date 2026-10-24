const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const storyScreen = document.querySelector('.story-screen');
const watchWrap = document.querySelector('.story-watch-wrap');
const storySteps = [...document.querySelectorAll('.story-step')];

function renderScreen(name) {
  const screens = {
    setup: ['assets/simulator-setup.png', 'RallyWrist 双打开赛设置真实模拟器界面'],
    score: ['assets/simulator-singles.png', 'RallyWrist 单打计分真实模拟器界面'],
    rotation: ['assets/simulator-doubles.png', 'RallyWrist 双打站位与计分真实模拟器界面'],
    metrics: ['assets/simulator-metrics.png', 'RallyWrist 运动数据真实模拟器界面']
  };

  const [src, alt] = screens[name];
  storyScreen.className = 'watch-screen story-screen';
  storyScreen.innerHTML = `<img class="simulator-shot" src="${src}" alt="${alt}" decoding="async" />`;
  watchWrap.classList.remove('pulse');
  requestAnimationFrame(() => watchWrap.classList.add('pulse'));
}

let activeStory = 'setup';
function updateStory() {
  const focusLine = innerHeight * 0.5;
  const closest = storySteps.reduce((winner, step) => {
    const box = step.getBoundingClientRect();
    const distance = Math.abs(box.top + box.height / 2 - focusLine);
    return !winner || distance < winner.distance ? { step, distance } : winner;
  }, null)?.step;
  if (!closest || closest.dataset.step === activeStory) return;
  activeStory = closest.dataset.step;
  storySteps.forEach((step) => step.classList.toggle('is-active', step === closest));
  renderScreen(activeStory);
}

addEventListener('scroll', updateStory, { passive: true });
addEventListener('resize', updateStory);
updateStory();

const scoreSequences = [...document.querySelectorAll('[data-score-sequence]')];
const sequenceState = new WeakMap();

function showScoreFrame(sequence, index) {
  const frames = [...sequence.querySelectorAll('.score-frame')];
  frames.forEach((frame, frameIndex) => {
    const active = frameIndex === index;
    frame.classList.toggle('is-active', active);
    frame.setAttribute('aria-hidden', String(!active));
  });
}

function playScoreSequence(sequence) {
  const state = sequenceState.get(sequence);
  if (!state || document.hidden || !state.visible) return;
  clearTimeout(state.scoreTimer);
  clearTimeout(state.loopTimer);
  showScoreFrame(sequence, 0);
  sequence.classList.remove('is-scoring', 'is-punching');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => sequence.classList.add('is-scoring'));
  });
  state.scoreTimer = setTimeout(() => {
    showScoreFrame(sequence, 1);
    sequence.classList.add('is-punching');
  }, Number(sequence.dataset.scoreDelay));
  state.loopTimer = setTimeout(() => playScoreSequence(sequence), Number(sequence.dataset.cycle));
}

const sequenceObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const state = sequenceState.get(entry.target);
    const becameVisible = entry.isIntersecting && !state.visible;
    state.visible = entry.isIntersecting;
    if (becameVisible && state.startOnReveal && !prefersReducedMotion) playScoreSequence(entry.target);
  });
}, { threshold: 0.2 });

scoreSequences.forEach((sequence) => {
  const isHero = sequence.classList.contains('hero-score-sequence');
  sequenceState.set(sequence, { visible: isHero, startOnReveal: true, scoreTimer: null, loopTimer: null });
  sequenceObserver.observe(sequence);
  if (!prefersReducedMotion && isHero) playScoreSequence(sequence);
});

function playHeroScore() {
  const heroSequence = document.querySelector('.hero-score-sequence');
  playScoreSequence(heroSequence);
}

function playFeatureScore() {
  const featureSequence = document.querySelector('.feature-score-sequence');
  const state = sequenceState.get(featureSequence);
  state.visible = true;
  state.startOnReveal = false;
  playScoreSequence(featureSequence);
}

const rotationGallery = document.querySelector('.rotation-gallery');
const rotationFigures = [...rotationGallery.querySelectorAll('figure')];
let rotationIndex = 0;
let rotationVisible = false;

new IntersectionObserver(([entry]) => {
  rotationVisible = entry.isIntersecting;
}, { threshold: 0.25 }).observe(rotationGallery);

if (!prefersReducedMotion) setInterval(() => {
  if (document.hidden || !rotationVisible) return;
  rotationFigures[rotationIndex].classList.remove('is-current');
  rotationIndex = (rotationIndex + 1) % rotationFigures.length;
  rotationFigures[rotationIndex].classList.add('is-current');
}, 2000);
