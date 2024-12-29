// app/test-yoomoney/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';

interface YooMoneyNotification {
  notification_type: string;
  operation_id: string;
  amount: string;
  withdraw_amount: string;
  currency: string;
  datetime: string;
  sender: string;
  codepro: string;
  label: string;
  sha1_hash: string;
  test_notification?: string;
  unaccepted: string;
  lastname?: string;
  firstname?: string;
  fathersname?: string;
  email?: string;
  phone?: string;
  city?: string;
  street?: string;
  building?: string;
  suite?: string;
  flat?: string;
  zip?: string;
}

const TestYooMoney = () => {
  const [notifications, setNotifications] = useState<YooMoneyNotification[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/yoomoney/notifications/received');
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      setNotifications(data.notifications);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Можно добавить интервал для регулярного обновления
    const interval = setInterval(fetchNotifications, 5000); // обновление каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Полученные уведомления от YooMoney</h1>
      <button
        onClick={fetchNotifications}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
        disabled={loading}
      >
        {loading ? 'Загрузка...' : 'Обновить'}
      </button>
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
      {notifications.length === 0 && !loading && (
        <p>Нет полученных уведомлений.</p>
      )}
      {notifications.length > 0 && (
        <div>
          {notifications.map((notif, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '5px',
              }}
            >
              <h3>Уведомление #{index + 1}</h3>
              <p>
                <strong>Тип уведомления:</strong> {notif.notification_type}
              </p>
              <p>
                <strong>ID операции:</strong> {notif.operation_id}
              </p>
              <p>
                <strong>Сумма:</strong> {notif.amount} {notif.currency}
              </p>
              <p>
                <strong>Списание:</strong> {notif.withdraw_amount}
              </p>
              <p>
                <strong>Дата и время:</strong> {notif.datetime}
              </p>
              <p>
                <strong>Отправитель:</strong> {notif.sender || 'Не указано'}
              </p>
              <p>
                <strong>Признак протекции:</strong> {notif.codepro}
              </p>
              <p>
                <strong>Метка платежа:</strong> {notif.label || 'Нет'}
              </p>
              <p>
                <strong>Тестовое уведомление:</strong>{' '}
                {notif.test_notification || 'Нет'}
              </p>
              <p>
                <strong>Статус перевода:</strong>{' '}
                {notif.unaccepted === 'true' ? 'Не зачислен' : 'Зачислен'}
              </p>
              {notif.lastname && (
                <>
                  <p>
                    <strong>ФИО:</strong> {notif.lastname} {notif.firstname}{' '}
                    {notif.fathersname}
                  </p>
                  <p>
                    <strong>Email:</strong> {notif.email || 'Не указан'}
                  </p>
                  <p>
                    <strong>Телефон:</strong> {notif.phone || 'Не указан'}
                  </p>
                  <p>
                    <strong>Адрес:</strong>{' '}
                    {`${notif.zip || ''} ${notif.city || ''} ${notif.street || ''} ${notif.building || ''}, ${notif.suite || ''}, кв. ${notif.flat || ''}`}
                  </p>
                </>
              )}
              <p>
                <strong>SHA-1 Hash:</strong> {notif.sha1_hash}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestYooMoney;
