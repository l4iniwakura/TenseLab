(() => {
  const phrases = {
    present: [
      ["Она работает каждый день.", "She works every day."],
      ["Она не работает каждый день.", "She does not work every day."],
      ["Она работает каждый день?", "Does she work every day?"],
    ],
    past: [
      ["Вчера она работала.", "She worked yesterday."],
      ["Вчера она не работала.", "She did not work yesterday."],
      ["Вчера она работала?", "Did she work yesterday?"],
    ],
    future: [
      ["Завтра она будет работать.", "She will work tomorrow."],
      ["Завтра она не будет работать.", "She will not work tomorrow."],
      ["Завтра она будет работать?", "Will she work tomorrow?"],
    ],
  };
  let tense = "present";
  let form = 0;
  const names = ["Утверждение", "Отрицание", "Вопрос"];
  const answer = document.querySelector("#demo-answer");
  const prompt = document.querySelector("#demo-prompt");
  const english = document.querySelector("#demo-english");
  const tabs = document.querySelectorAll("[data-tense]");
  const render = () => {
    answer.open = false;
    prompt.textContent = phrases[tense][form][0];
    english.textContent = phrases[tense][form][1];
    document.querySelector("#demo-form").textContent = names[form];
    tabs.forEach((tab) =>
      tab.setAttribute("aria-pressed", String(tab.dataset.tense === tense)),
    );
  };
  // Only changing exercises is announced. Opening <details> exposes its answer natively.
  prompt.setAttribute("aria-live", "polite");
  prompt.setAttribute("aria-atomic", "true");
  tabs.forEach((tab) => {
    tab.disabled = false;
    tab.addEventListener("click", () => {
      tense = tab.dataset.tense;
      render();
    });
  });
  const next = document.querySelector("#next-form");
  next.disabled = false;
  next.addEventListener("click", () => {
    form = (form + 1) % 3;
    render();
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          const picture = target.tagName === "FIGURE";
          target.style.animation = `${picture ? "settle" : "rise"} ${picture ? 850 : 650}ms cubic-bezier(.22,1,.36,1) both`;
          observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".section-intro > *, .staircase h3, .staircase p, .screens figure, .faq h2, .questions details, .closing-top > *, .footer-wordmark",
      )
      .forEach((el) => observer.observe(el));
    document
      .querySelectorAll(
        ".brand, .hero h1 span, .demo, .hero-description, .hero-start",
      )
      .forEach((el, index) => {
        el.style.animation = `${index === 3 ? "reel" : "rise"} 750ms cubic-bezier(.22,1,.36,1) ${index * 65}ms both`;
      });
    // The real product screenshot moves gently as its section enters.
    const image = document.querySelector(".screen-main img");
    const drift = () => {
      if (reducedMotion.matches) {
        image.style.transform = "";
        return;
      }
      const rect = image.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        const progress = Math.max(
          0,
          Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)),
        );
        image.style.transform = `scale(${1 + progress * 0.035})`;
      }
    };
    let queued = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(() => {
            drift();
            queued = false;
          });
        }
      },
      { passive: true },
    );
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        observer.disconnect();
        document.getAnimations().forEach((animation) => animation.cancel());
        image.style.transform = "";
      }
    });
  }
})();
