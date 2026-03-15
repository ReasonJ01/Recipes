document.addEventListener("DOMContentLoaded", function () {
  if ("IntersectionObserver" in window === false) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sections = document.querySelectorAll(".recipe-section");
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  sections.forEach(function (section) {
    section.style.opacity = "0";
    section.style.transform = "translateY(12px)";
    section.style.transition =
      "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
    observer.observe(section);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      sections.forEach(function (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          section.classList.add("revealed");
        }
      });
    }
  });
});
