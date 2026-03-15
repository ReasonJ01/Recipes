document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll(".recipe-ingredients__checkbox");
  const storageKey = "recipe-ingredients-";

  checkboxes.forEach(function (checkbox) {
    const targetId = checkbox.id;
    const target = document.querySelector('[data-checkbox-target="' + targetId + '"]');
    if (!target) return;

    const key = storageKey + window.location.pathname + "-" + targetId;
    const saved = localStorage.getItem(key);
    if (saved === "true") {
      checkbox.checked = true;
      target.classList.add("checked");
    }

    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        target.classList.add("checked");
        localStorage.setItem(key, "true");
      } else {
        target.classList.remove("checked");
        localStorage.removeItem(key);
      }
    });
  });
});
