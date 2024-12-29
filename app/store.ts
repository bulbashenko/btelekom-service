// store.ts

export interface YooMoneyNotification {
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

// Хранилище уведомлений
const notifications: YooMoneyNotification[] = [];

export const addNotification = (notification: YooMoneyNotification) => {
  notifications.push(notification);
};

export const getNotifications = (): YooMoneyNotification[] => {
  return notifications;
};
