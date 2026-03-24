import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import React, { useCallback, useEffect, useState } from "react";
import {
  getOrderStatus,
  managerOrderStatuses,
  ManagerOrderStatusType,
  OrdersFilterData,
  OrderStatus,
  personalOrderStatuses,
  PersonalOrderStatusType,
  RegistrationType,
} from "./OrderFilterModel";
import DatePicker from "react-datepicker";

interface OrdersFilterFormProps {
  initialRegistrationType?: RegistrationType;
  initialOrderStatus?: PersonalOrderStatusType | ManagerOrderStatusType;
  availableRegistrationTypes: RegistrationType[];
  initialStartDate?: Date;
  initialEndDate?: Date;
  onSubmit: (data: OrdersFilterData) => void;
}

function OrdersFilterForm({
  initialRegistrationType,
  initialOrderStatus = personalOrderStatuses[0].type,
  availableRegistrationTypes,
  initialStartDate,
  initialEndDate,
  onSubmit,
}: OrdersFilterFormProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    initialStartDate ?? null
  );
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate ?? null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>(
    initialRegistrationType ?? availableRegistrationTypes[0]
  );
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(() =>
    getOrderStatus(registrationType, initialOrderStatus)
  );

  const orderStatuses =
    registrationType === "personal"
      ? personalOrderStatuses
      : managerOrderStatuses;

  useEffect(() => {
    setSelectedStatus(getOrderStatus(registrationType, initialOrderStatus));
  }, [initialOrderStatus, registrationType]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const rangeMaxDate =
    startDate && !endDate
      ? new Date(new Date(startDate).setDate(startDate.getDate() + 13))
      : undefined;
  const today = new Date();
  const maxDate = rangeMaxDate && rangeMaxDate < today ? rangeMaxDate : today;

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (startDate && endDate) {
        setIsSubmitting(true);
        onSubmit({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          registrationType,
          orderStatus: selectedStatus.type,
        } as OrdersFilterData);
      }
    },
    [startDate, endDate, registrationType, selectedStatus, onSubmit]
  );

  return (
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 400, margin: "0 auto", padding: "20px" }}
      >
        <Stack spacing={3}>
          {availableRegistrationTypes.length > 1 && (
            <FormControl fullWidth>
              <InputLabel>Тип регистрации</InputLabel>
              <Select
                value={registrationType}
                label="Тип регистрации"
                onChange={(e) =>
                  setRegistrationType(e.target.value as RegistrationType)
                }
              >
                {availableRegistrationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === "personal" ? "Личная" : "Менеджерская"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth>
            <InputLabel>Статус заказа</InputLabel>
            <Select
              value={selectedStatus}
              renderValue={(value) => value.label}
              label="Статус заказа"
              onChange={(e) => {
                const status = orderStatuses.find(
                  (status) => status.label === e.target.value
                );
                if (status) {
                  setSelectedStatus(status);
                }
              }}
            >
              {orderStatuses.map((status) => (
                <MenuItem key={status.type} value={status.label}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ display: "flex", alignItems: "center" }}>
            <DatePicker
              selected={startDate}
              onChange={([start, end]) => {
                setStartDate(start);
                setEndDate(end);
              }}
              startDate={startDate}
              endDate={endDate}
              maxDate={maxDate}
              selectsRange
              selectsDisabledDaysInRange
              inline
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={!startDate || !endDate || isSubmitting}
            fullWidth
          >
            Показать
          </Button>
        </Stack>
      </form>
  );
}

export default OrdersFilterForm;
