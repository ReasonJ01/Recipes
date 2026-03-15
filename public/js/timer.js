const TIMER_STORAGE_KEY = "recipe-timer";

function saveTimer(endTime, minutes, recipeTitle) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      endTime: endTime,
      minutes: minutes,
      recipeTitle: recipeTitle || document.title,
    }));
  } catch (e) {}
}

function clearTimer() {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (e) {}
}

function getStoredTimer() {
  try {
    const data = localStorage.getItem(TIMER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function scheduleNotification(endTime, minutes, recipeTitle) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!navigator.serviceWorker || !navigator.serviceWorker.ready) return;

  navigator.serviceWorker.ready.then(function (reg) {
    if ("showTrigger" in Notification.prototype && typeof TimestampTrigger !== "undefined") {
      reg.showNotification("Timer done!", {
        body: minutes + " min timer finished – " + (recipeTitle || "Recipe"),
        tag: "recipe-timer-done",
        showTrigger: new TimestampTrigger(endTime),
      });
    }
  });
}

function showPersistentNotification(minutes, recipeTitle) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (!navigator.serviceWorker || !navigator.serviceWorker.ready) return;

  navigator.serviceWorker.ready.then(function (reg) {
    reg.getNotifications().then(function (existing) {
      existing.filter(function (n) { return n.tag === "recipe-timer-active"; }).forEach(function (n) { n.close(); });
    });
    reg.showNotification("Recipe timer: " + minutes + " min", {
      body: (recipeTitle || "Tap to open") + " – countdown in app",
      tag: "recipe-timer-active",
      requireInteraction: true,
      data: { url: window.location.href },
    });
  });
}

function closeTimerNotification() {
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then(function (reg) {
      reg.getNotifications().then(function (ns) {
        ns.filter(function (n) { return n.tag === "recipe-timer-active"; }).forEach(function (n) { n.close(); });
      });
    });
  }
}

function notifyTimerDone(minutes, playSound) {
  closeTimerNotification();
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Timer done!", { body: minutes + " minute timer finished." });
  }
  if (playSound !== false) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }
}

function restoreTimer(button, endTime, minutes, originalLabel) {
  function updateDisplay() {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (remaining <= 0) {
      clearInterval(activeTimer);
      activeTimer = null;
      originalLabel && (button.querySelector(".recipe-timer__label").textContent = originalLabel);
      button.classList.remove("recipe-timer--active");
      clearTimer();
      notifyTimerDone(minutes);
      return;
    }
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    button.querySelector(".recipe-timer__label").textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }
  button.classList.add("recipe-timer--active");
  updateDisplay();
  return setInterval(updateDisplay, 1000);
}

let activeTimer = null;

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".recipe-timer");
  const recipeTitle = document.querySelector(".recipe-title")?.textContent || document.title;

  const stored = getStoredTimer();
  if (stored && stored.endTime > Date.now()) {
    const endTime = stored.endTime;
    const minutes = stored.minutes;
    const idx = Array.from(buttons).findIndex(function (b) { return parseInt(b.dataset.minutes, 10) === minutes; });
    const button = idx >= 0 ? buttons[idx] : buttons[0];
    if (button) {
      const originalLabel = button.querySelector(".recipe-timer__label").textContent;
      activeTimer = restoreTimer(button, endTime, minutes, originalLabel);
    }
  } else if (stored && stored.endTime <= Date.now()) {
    clearTimer();
    notifyTimerDone(stored.minutes, false);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const minutes = parseInt(button.dataset.minutes, 10);
      if (!minutes || isNaN(minutes)) return;

      if (activeTimer) {
        clearInterval(activeTimer);
        activeTimer = null;
      }

      const endTime = Date.now() + minutes * 60 * 1000;
      const label = button.querySelector(".recipe-timer__label");
      const originalLabel = label.textContent;

      saveTimer(endTime, minutes, recipeTitle);
      scheduleNotification(endTime, minutes, recipeTitle);
      showPersistentNotification(minutes, recipeTitle);

      activeTimer = restoreTimer(button, endTime, minutes, originalLabel);
    });
  });

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    const stored = getStoredTimer();
    if (stored && stored.endTime <= Date.now()) {
      clearTimer();
      notifyTimerDone(stored.minutes, false);
    }
  }
});
