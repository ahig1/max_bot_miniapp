import { useCallback } from "react";
import { closeWebApp } from "../../api/telegram";
import { applyOrderFilter } from "../../api/user";
import { ManagerOrderStatusType, OrdersFilterData, PersonalOrderStatusType, RegistrationType } from "./OrderFilterModel";
import OrdersFilterForm from "./OrdersFilterForm";

interface OrdersFilterContainerProps {
  initialRegistrationType?: RegistrationType;
  initialOrderStatus?: PersonalOrderStatusType | ManagerOrderStatusType;
  initialStartDate?: Date;
  initialEndDate?: Date;
  availableRegistrationTypes: RegistrationType[];
}

function OrdersFilterContainer({
  initialRegistrationType,
  initialOrderStatus,
  availableRegistrationTypes,
  initialStartDate,
  initialEndDate,
}: OrdersFilterContainerProps) {
  const handleSubmit = useCallback(async (data: OrdersFilterData) => {
    await applyOrderFilter(data);
    closeWebApp();
  }, []);

  return (
    <OrdersFilterForm
      initialRegistrationType={initialRegistrationType}
      initialOrderStatus={initialOrderStatus}
      initialStartDate={initialStartDate}
      initialEndDate={initialEndDate}
      availableRegistrationTypes={availableRegistrationTypes}
      onSubmit={handleSubmit}
    />
  );
}

export default OrdersFilterContainer;
