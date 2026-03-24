export type RegistrationType = "personal" | "manager";

export type ManagerOrderStatusType =
  | "awaiting_processing"
  | "awaiting_confirmation"
  | "active"
  | "at_work"
  | "in_stock"
  | "issued";

export type PersonalOrderStatusType =
  | "awaiting_processing"
  | "awaiting_payment"
  | "ordered"
  | "purchased"
  | "on_the_way"
  | "active"
  | "out_of_stock"
  | "in_stock"
  | "issued";

interface CommonOrdersFilterData {
  startDate: string | null;
  endDate: string | null;
}

interface PersonalOrdersFilterData extends CommonOrdersFilterData {
  registrationType: "manager";
  orderStatus: PersonalOrderStatusType;
}

interface ManagerOrdersFilterData extends CommonOrdersFilterData {
  registrationType: "personal";
  orderStatus: ManagerOrderStatusType;
}

export type OrdersFilterData =
  | PersonalOrdersFilterData
  | ManagerOrdersFilterData;

export type OrderStatus = {
  type: PersonalOrderStatusType | ManagerOrderStatusType;
  label: string;
};

export const personalOrderStatuses: OrderStatus[] = [
  { type: "awaiting_processing", label: "Ожидает обработки" },
  { type: "awaiting_payment", label: "Ожидает оплаты" },
  { type: "ordered", label: "Заказано" },
  { type: "purchased", label: "Закуплено" },
  { type: "on_the_way", label: "В пути" },
  { type: "active", label: "Активные" },
  { type: "out_of_stock", label: "Нет в наличии" },
  { type: "in_stock", label: "На складе" },
  { type: "issued", label: "Выдано" },
];

export const managerOrderStatuses: OrderStatus[] = [
  { type: "awaiting_processing", label: "Ожидает обработки" },
  { type: "awaiting_confirmation", label: "Ожидает подтверждения" },
  { type: "active", label: "Активные" },
  { type: "at_work", label: "В работе" },
  { type: "in_stock", label: "На складе" },
  { type: "issued", label: "Выдано" },
];

export function getOrderStatus(registrationType: RegistrationType, status: ManagerOrderStatusType | PersonalOrderStatusType): OrderStatus {
  if (registrationType === "personal") {
    return personalOrderStatuses.find((os) => os.type === status) ?? personalOrderStatuses[0];
  }
  return managerOrderStatuses.find((os) => os.type === status) ?? managerOrderStatuses[0];
}

