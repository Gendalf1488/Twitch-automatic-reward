// Функция для поиска и клика по кнопке
function claimReward() {
  // Метод 1: Поиск по aria-label
  const button = document.querySelector('button[aria-label="Получить бонус"]');
  if (button) {
    button.click();
    chrome.runtime.sendMessage({ action: "rewardClaimed", amount: 50 }); // Отправляем сообщение
    return;
  }

  // Метод 2: Поиск через вложенный div с текстом "Получить бонус"
  const labelDiv = document.querySelector('div.ScCoreButtonLabel-sc-s7h2b7-0');
  if (labelDiv && labelDiv.textContent.trim() === "Получить бонус") {
    const parentButton = labelDiv.closest("button");
    if (parentButton) {
      parentButton.click();
      chrome.runtime.sendMessage({ action: "rewardClaimed", amount: 50 }); // Отправляем сообщение
      return;
    }
  }

  // Если кнопка не найдена, ничего не делаем
  console.log("Кнопка 'Получить бонус' не найдена.");
}

// Вызываем функцию claimReward при загрузке content.js
claimReward();