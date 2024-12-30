/* eslint-disable */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { prisma } from '@/lib/prisma'; // Ваша основная БД
import dayjs from 'dayjs';

export async function updateXUI() {
  try {
    // 1. Получаем из основной БД активных пользователей (подписка ещё не истекла)
    const activeUsers = await prisma.user.findMany({
      where: {
        paidUntil: {
          gt: new Date(),
        },
      },
    });

    if (activeUsers.length === 0) {
      console.log('Нет активных пользователей для обновления.');
      return;
    }

    // 2. Подключаемся к x-ui.db
    const db = await open({
      filename: 'db/x-ui/x-ui.db', // Убедитесь, что путь корректен
      driver: sqlite3.Database,
    });

    // 3. Находим inbound с protocol = "vless"
    const inboundRow = await db.get(
      `SELECT id, settings FROM inbounds WHERE protocol = 'vless' LIMIT 1`
    );

    if (!inboundRow) {
      throw new Error("Не найден inbound с protocol='vless'");
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

    // Инициализируем поле clients, если его нет
    if (!Array.isArray(settingsJson.clients)) {
      settingsJson.clients = [];
    }

    // 4. Создаём карту существующих клиентов для быстрого доступа
    const existingClientsMap = new Map<string, any>();
    settingsJson.clients.forEach((client: any) => {
      existingClientsMap.set(client.id, client);
    });

    // 5. Обрабатываем активных пользователей
    for (const user of activeUsers) {
      const clientData = {
        id: user.uuid, // UUID из вашей БД
        flow: 'xtls-rprx-vision', // Пример значения, измените при необходимости
        email: user.email, // Email пользователя
        expiryTime: dayjs(user.paidUntil).unix(), // Время истечения подписки в формате Unix
        enable: true, // Активировать клиента

        // Дополнительные поля по необходимости
        limitIp: 0,
        totalGB: 0,
        tgId: '',
        subId: '', // Или другое значение, если требуется
        reset: 0,
      };

      if (existingClientsMap.has(user.uuid)) {
        // Если клиент уже существует, обновляем его данные
        const existingClient = existingClientsMap.get(user.uuid);
        Object.assign(existingClient, clientData);
      } else {
        // Если клиента нет, добавляем нового
        settingsJson.clients.push(clientData);
      }
    }

    // 6. (Необязательно) Удаляем клиентов, которых нет в activeUsers
    const activeUUIDs = new Set(activeUsers.map(user => user.uuid));
    settingsJson.clients = settingsJson.clients.filter((client: any) =>
      activeUUIDs.has(client.id)
    );

    // 7. Сериализуем обновлённые настройки обратно в строку
    const updatedSettings = JSON.stringify(settingsJson);

    // 8. Сохраняем изменения обратно в x-ui.db
    await db.run(`UPDATE inbounds SET settings = ? WHERE id = ?`, [
      updatedSettings,
      inboundRow.id,
    ]);

    // Закрываем соединение с базой данных
    await db.close();

    console.log('VLESS клиенты успешно обновлены!');
  } catch (error) {
    console.error('Ошибка при обновлении VLESS клиентов:', error);
  }
}
