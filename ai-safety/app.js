document.documentElement.classList.add("js");

const progress = document.querySelector("#readingProgress");

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progress.style.transform = "scaleX(" + value + ")";
}

updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const dashboardLinks = Array.from(document.querySelectorAll("[data-story]"));
const storyIds = Array.from(new Set(dashboardLinks.map(function (link) { return link.dataset.story; })));
const storySections = storyIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

function markActiveStory(id) {
  dashboardLinks.forEach(function (link) {
    const active = link.dataset.story === id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    const visible = entries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
    if (visible) markActiveStory(visible.target.id);
  }, { rootMargin: "-18% 0px -58% 0px", threshold: [0.08, 0.25, 0.5] });

  storySections.forEach(function (section) { observer.observe(section); });
}

dashboardLinks.forEach(function (link) {
  link.addEventListener("click", function () { markActiveStory(link.dataset.story); });
});

const copyButton = document.querySelector("#copyButton");
if (copyButton) {
  copyButton.addEventListener("click", async function () {
    const original = "Copy link";
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      copyButton.textContent = "Link copied";
    } catch (error) {
      copyButton.textContent = "Copy unavailable";
    }
    window.setTimeout(function () { copyButton.textContent = original; }, 1800);
  });
}

document.querySelector("#printButton")?.addEventListener("click", function () { window.print(); });

const visualDialog = document.querySelector("#visualBriefDialog");
const briefOpeners = document.querySelectorAll("[data-open-brief]");

briefOpeners.forEach(function (opener) {
  opener.addEventListener("click", function () {
    if (visualDialog && typeof visualDialog.showModal === "function") visualDialog.showModal();
  });
});

if (visualDialog) {
  visualDialog.addEventListener("click", function (event) {
    const bounds = visualDialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) visualDialog.close();
  });
}
