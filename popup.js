let isEnabled = false;
let rewardCount = 0;

// Загрузка состояния из хранилища
chrome.storage.sync.get(["enabled", "rewardCount"], (data) => {
  isEnabled = data.enabled || false;
  rewardCount = data.rewardCount || 0;
  updateUI();
});

// Обновление UI
function updateUI() {
  document.getElementById("toggleButton").textContent = isEnabled ? "Выключить" : "Включить";
  document.getElementById("status").textContent = isEnabled ? "Включен" : "Выключен";
  document.getElementById("rewardCount").textContent = rewardCount;
}

// Отправка сообщения в background.js для переключения состояния
document.getElementById("toggleButton").addEventListener("click", () => {
  isEnabled = !isEnabled;
  chrome.runtime.sendMessage({ action: "toggle", state: isEnabled });
  updateUI();
});

// Обработчик кнопки сброса счетчика
document.getElementById("resetButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "resetCounter" });
  rewardCount = 0;
  updateUI();
});

// Обработка сообщений от background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateRewardCount") {
    rewardCount = message.count;
    updateUI();
  }
});