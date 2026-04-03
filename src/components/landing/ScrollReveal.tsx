'use client';

import { useEffect } from 'react';

export function ScrollReveal(): null {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (revealElements.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    revealElements.forEach((element, index) => {
      const existingDelay = element.style.getPropertyValue('--reveal-delay');
      if (!existingDelay) {
        element.style.setProperty('--reveal-delay', `${Math.min(index * 70, 400)}ms`);
      }
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
