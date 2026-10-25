document.documentElement.classList.add("js");

const progress = document.querySelector("#readingProgress");

function updateProgress() {
  if (!progress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progress.style.transform = "scaleX(" + value + ")";
}

function resolvePath(object, path) {
  return path.split(".").reduce(function (value, key) {
    return value == null ? undefined : value[key];
  }, object);
}

function latestScheduledEditionDate() {
  const now = Date.now();
  for (let offset = 0; offset < 8; offset += 1) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Australia/Adelaide", year: "numeric", month: "2-digit", day: "2-digit",
      weekday: "short", hour: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date(now - offset * 86400000)).filter(function (part) {
      return part.type !== "literal";
    }).map(function (part) { return [part.type, part.value]; }));
    if ((parts.weekday === "Mon" || parts.weekday === "Thu") && (offset > 0 || Number(parts.hour) >= 6)) {
      return parts.year + "-" + parts.month + "-" + parts.day;
    }
  }
  return "";
}

function renderEdition(data) {
  document.querySelectorAll("[data-bind]").forEach(function (node) {
    const value = resolvePath(data, node.dataset.bind);
    if (value !== undefined && value !== null) node.textContent = String(value);
  });

  document.querySelectorAll("[data-bind-href]").forEach(function (node) {
    const value = resolvePath(data, node.dataset.bindHref);
    if (typeof value === "string" && /^https:\/\//.test(value)) node.href = value;
  });

  const currentTier = Number(data.threat && data.threat.currentTier);
  document.querySelectorAll("[data-tier]").forEach(function (row) {
    row.classList.toggle("current", Number(row.dataset.tier) === currentTier);
  });

  document.documentElement.dataset.edition = String(data.edition && data.edition.number || "current");
  const publishedDate = String(data.edition && data.edition.publishedAt || "").slice(0, 10);
  document.querySelectorAll('time[data-bind="edition.displayDate"]').forEach(function (node) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(publishedDate)) node.setAttribute("datetime", publishedDate);
  });
  const status = document.querySelector("#editionStatus");
  if (status) status.textContent = publishedDate >= latestScheduledEditionDate() ? "Current published edition" : "Previous edition · awaiting update";
}

async function loadEdition() {
  try {
    const response = await fetch("data/latest.json?v=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("Edition feed unavailable");
    const data = await response.json();
    renderEdition(data);
  } catch (error) {
    const status = document.querySelector("#editionStatus");
    if (status) status.textContent = "Cached edition";
  }
}

loadEdition();
updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const trackedLinks = Array.from(document.querySelectorAll("[data-metric-index], [data-story-index]"));
const sectionIds = ["capability-story", "cyber-story", "control-story", "governance-story", "public-story", "method-story"];
const sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

function markActive(id) {
  const map = {
    "capability-story": 0,
    "cyber-story": 1,
    "control-story": 2,
    "governance-story": 3,
    "public-story": 4
  };

  trackedLinks.forEach(function (link) {
    const activeStory = link.dataset.storyIndex !== undefined && Number(link.dataset.storyIndex) === map[id];
    const activeMetric = link.getAttribute("href") === "#" + id;
    const active = activeStory || activeMetric;
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
    if (visible) markActive(visible.target.id);
  }, { rootMargin: "-18% 0px -58% 0px", threshold: [0.08, 0.25, 0.5] });

  sections.forEach(function (section) { observer.observe(section); });
}

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
