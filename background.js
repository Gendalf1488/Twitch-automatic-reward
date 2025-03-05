let isEnabled = false;

// Загрузка начального состояния
chrome.storage.sync.get(["enabled", "rewardCount"], (data) => {
  isEnabled = data.enabled || false;
  const rewardCount = data.rewardCount || 0;
  console.log(`Загружено состояние: ${isEnabled}, счётчик: ${rewardCount}`);
});

// Обработка сообщений от popup и content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === "toggle") {
      isEnabled = message.state;

      // Сохраняем новое состояние
      chrome.storage.sync.set({ enabled: isEnabled }, () => {
        console.log(`Состояние изменено на: ${isEnabled}`);

        if (isEnabled) {
          startClaiming();
        } else {
          stopClaiming();
        }

        sendResponse({ success: true, state: isEnabled });
      });

      return true; // Асинхронный ответ
    } else if (message.action === "rewardClaimed") {
      updateRewardCount(message.amount); // Обновляем счётчик
    } else if (message.action === "resetCounter") {
      resetRewardCounter();
    }
  } catch (error) {
    console.error("Ошибка при обработке сообщения:", error);
  }

  return true; // Асинхронный ответ
});

// Начинаем сборку наград
function startClaiming() {
  console.log("Автоматический сборщик наград включен.");
}

// Останавливаем сборку наград
function stopClaiming() {
  console.log("Автоматический сборщик наград выключен.");
}

// Проверяем активную вкладку на наличие кнопки
function checkActiveTabForRewards() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;

      // Выполняем content.js на активной вкладке
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      }).catch((error) => {
        console.error("Ошибка при выполнении content.js:", error);
      });
    }
  });
}

// Обновляем счётчик наград
function updateRewardCount(amount) {
  chrome.storage.sync.get("rewardCount", (data) => {
    let currentCount = data.rewardCount || 0;

    // Защита от дублирования
    const expectedCount = currentCount + amount;
    if (expectedCount > currentCount) {
      currentCount += amount;
    } else {
      console.warn("Попытка дублирования награды. Игнорируем.");
      return;
    }

    // Сохраняем обновленный счётчик
    chrome.storage.sync.set({ rewardCount: currentCount }, () => {
      console.log(`Счётчик обновлен: +${amount}. Текущее значение: ${currentCount}`);

      // Отправляем сообщение в popup для обновления интерфейса
      sendMessageToPopup({ action: "updateRewardCount", count: currentCount });
    });
  });
}

// Сброс счётчика наград
function resetRewardCounter() {
  chrome.storage.sync.set({ rewardCount: 0 }, () => {
    console.log("Счётчик наград сброшен.");

    // Отправляем сообщение в popup для обновления интерфейса
    sendMessageToPopup({ action: "updateRewardCount", count: 0 });
  });
}

// Отправляем сообщение в popup с защитой от ошибок
function sendMessageToPopup(message) {
  try {
    chrome.runtime.sendMessage(message).catch(() => {
      console.warn("Не удалось отправить сообщение в popup. Возможно, popup закрыт.");
    });
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error.message);
  }
}

// Периодическая проверка каждые 10 секунд
setInterval(() => {
  if (isEnabled) {
    checkActiveTabForRewards();
  }
}, 10000); // Каждые 10 секунд