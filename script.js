const scoreArjuna = 0;
const scoreBharatha = 0;

function animateCount(el, target, duration) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('DOMContentLoaded', () => {
  const houseScores = document.querySelectorAll('.house-score');
  animateCount(houseScores[0], scoreArjuna, 900);
  animateCount(houseScores[1], scoreBharatha, 900);

  const total = scoreArjuna + scoreBharatha;
  const pctA = total ? (scoreArjuna / total) * 100 : 50;
  const pctB = total ? (scoreBharatha / total) * 100 : 50;
  document.querySelector('.tug-fill-a').style.width = pctA + '%';
  document.querySelector('.tug-fill-b').style.width = pctB + '%';

  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
});
