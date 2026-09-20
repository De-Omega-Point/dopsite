document.documentElement.classList.add("js");

const progress = document.querySelector("#readingProgress");

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progress.style.transform = `scaleX(${value})`;
}

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const dashboardLinks = [...document.querySelectorAll("[data-story]")];
const storyIds = [...new Set(dashboardLinks.map((link) => link.dataset.story))];
const storySections = storyIds.map((id) => document.getElementById(id)).filter(Boolean);

function markActiveStory(id) {
  dashboardLinks.forEach((link) => {
    const active = link.dataset.story === id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) markActiveStory(visible.target.id);
  }, { rootMargin: "-16% 0px -58% 0px", threshold: [0.08, 0.25, 0.5] });
  storySections.forEach((section) => observer.observe(section));
}

dashboardLinks.forEach((link) => {
  link.addEventListener("click", () => markActiveStory(link.dataset.story));
});

const copyButton = document.querySelector("#copyButton");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const original = "Copy link";
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      copyButton.textContent = "Link copied";
    } catch {
      copyButton.textContent = "Copy unavailable";
    }
    window.setTimeout(() => { copyButton.textContent = original; }, 1800);
  });
}

document.querySelector("#printButton")?.addEventListener("click", () => window.print());
