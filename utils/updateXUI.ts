import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { prisma } from "@/lib/prisma"; // Ваша основная БД
import dayjs from "dayjs";

export async function updateXUI() {
  // 1. Берём из своей БД активных юзеров (подписка ещё не истекла)
  const activeUsers = await prisma.user.findMany({
    where: {
      paidUntil: {
        gt: new Date(),
      },
    },
  });

  // 2. Подключаемся к x-ui.db
  const db = await open({
    filename: "/etc/x-ui/x-ui.db", // или нужный путь
    driver: sqlite3.Database,
  });

  // 3. Находим inbound, где protocol = "vless"
  //    (Может быть несколько, выбираем нужный. Допустим, берём первый.)
  const inboundRow = await db.get(
    `SELECT id, settings FROM inbounds WHERE protocol = 'vless' LIMIT 1`
  );
  if (!inboundRow) {
    throw new Error("Не найден inbound c protocol='vless'");
  }

  // Парсим JSON из поля settings
  let settingsJson: any;
  try {
    settingsJson = JSON.parse(inboundRow.settings);
  } catch (err) {
    throw new Error(
      `Не удалось распарсить JSON из inbounds.settings (id=${inboundRow.id}): ${err}`
    );
  }

  // Если нет поля "clients", инициализируем пустым массивом
  if (!Array.isArray(settingsJson.clients)) {
    settingsJson.clients = [];
  }

  // 4. Собираем массив клиентов под x-ui формат
  //    Каждый клиент: { id, email, flow, expiryTime, enable, ... }
  const newClients = activeUsers.map((user) => ({
    // UUID из вашей БД
    id: user.uuid,
    // flow
    flow: "xtls-rprx-vision",
    // email (может быть любым уникальным идентификатором)
    email: user.email,
    // Время истечения подписки (unixtime)
    expiryTime: dayjs(user.paidUntil).unix(),
    // Обязательно "enable": true, чтобы было активно
    enable: true,

    // Остальные поля, если хотите:
    limitIp: 0,
    totalGB: 0,
    tgId: "",
    subId: "", // или что-то ещё, если нужно
    reset: 0,
  }));

  // 5. Записываем этих клиентов в settingsJson.clients
  //    - Можно просто ПОЛНОСТЬЮ заменить массив на newClients
  //    - Или, если хотите «добавлять», нужно сливать по uuid
  // Здесь, предположим, мы ЗАМЕНИМ всех клиентов на тех, что активны в нашей БД
  settingsJson.clients = newClients;

  // 6. Сериализуем обновлённые settings обратно в строку
  const updatedSettings = JSON.stringify(settingsJson);

  // 7. Сохраняем обратно в x-ui.db
  await db.run(`UPDATE inbounds SET settings = ? WHERE id = ?`, [
    updatedSettings,
    inboundRow.id,
  ]);

  // (Необязательно) закрываем соединение
  await db.close();

  console.log("VLESS clients успешно обновлены!");
}

