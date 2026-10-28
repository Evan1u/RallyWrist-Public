/* M1–M4: output/site-scroll-motion/motion-inventory.json. */
(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    roomy: '(min-height: 700px)',
    desktop: '(min-width: 701px)'
  }, context => {
    if (!context.conditions.motion) return;
    const { roomy, desktop } = context.conditions;
    const root = document.documentElement;
    const chapters = [...document.querySelectorAll('.score-chapter')];
    if (roomy) root.classList.add('scroll-story');

    // M1: the title leads; the product follows. The inner watch UI is untouched.
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-copy .eyebrow', { y: 24, autoAlpha: 0, duration: 0.75 })
      .from('.hero-line', { y: 34, autoAlpha: 0, duration: 0.85, stagger: 0.08 }, 0.1)
      .from('.hero-copy .lede', { y: 24, autoAlpha: 0, duration: 0.8 }, 0.22)
      .from('.hero-device', { y: 84, autoAlpha: 0, duration: 1.05 }, 0.18);

    if (roomy) {
      const navHeight = () => document.querySelector('.nav').offsetHeight;
      // M2: the product begins close and resolves to a full view while the stage holds.
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'hero-story', trigger: '.hero-stage', start: () => `top top+=${navHeight()}`,
          end: () => `+=${innerHeight * 0.85}`, pin: true, scrub: 0.45,
          anticipatePin: 1, invalidateOnRefresh: true
        }
      })
        .fromTo('.hero-product-motion', { scale: desktop ? 1.45 : 1.23, y: 36, transformOrigin: '50% 0%' }, { scale: 1, y: -54, duration: 1 }, 0)
        .to('.hero-copy', { y: -40, autoAlpha: 0, duration: 0.5 }, 0.12);

      // M3: preserve working playback controls throughout both copy chapters.
      gsap.set(chapters[1], { autoAlpha: 0, y: 38 });
      const updateChapterAccess = second => {
        chapters[0].setAttribute('aria-hidden', String(second));
        chapters[1].setAttribute('aria-hidden', String(!second));
      };
      updateChapterAccess(false);
      gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate() { updateChapterAccess(this.progress() > 0.47); },
        scrollTrigger: {
          id: 'score-story', trigger: '.scoring-panel', start: () => `top top+=${navHeight() + 12}`,
          end: () => `+=${innerHeight * 1.15}`, pin: true, scrub: 0.4,
          anticipatePin: 1, invalidateOnRefresh: true
        }
      })
        .fromTo('.score-device', { scale: 0.94 }, { scale: 1, duration: 0.35 }, 0)
        .to(chapters[0], { y: -38, autoAlpha: 0, duration: 0.22 }, 0.28)
        .to(chapters[1], { y: 0, autoAlpha: 1, duration: 0.25 }, 0.46)
        .to({}, { duration: 0.29 });
    } else {
      gsap.from('.scoring-panel', {
        y: 48, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.scoring-panel', start: 'top 90%', once: true }
      });
    }

    // M4: desktop cards enter in order; on mobile each waits for its own viewport entry.
    gsap.from('.features-title', {
      y: 48, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.features-title', start: 'top 92%', once: true }
    });
    const cards = gsap.utils.toArray('.gallery figure');
    if (desktop) {
      gsap.from(cards, {
        y: 72, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.gallery', start: 'top 90%', once: true }
      });
    } else {
      cards.forEach(card => gsap.from(card, {
        y: 72, autoAlpha: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 94%', once: true }
      }));
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      root.classList.remove('scroll-story');
      chapters.forEach(chapter => chapter.removeAttribute('aria-hidden'));
    };
  });
})();
