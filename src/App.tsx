import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useMemo } from "react";
import { expandWebapp, getLaunchPayload } from "./api/telegram";
import { Loading } from "./components/Loading/Loading";
import { useTheme } from "./hooks/useTheme";
import { ManagerOrderStatusType, PersonalOrderStatusType, RegistrationType } from "./pages/OrdersFilter/OrderFilterModel";
import { DeliveryType } from "./pages/PersonalDataForm/PersonalDataModel";

const PersonalDataContainer = lazy(
  () => import("./pages/PersonalDataForm/PersonalDataContainer")
);
const VinRequestContainer = lazy(
  () => import("./pages/VinRequestForm/VinRequestContainer")
);
const OrganizationTerms = lazy(
  () => import("./pages/OrganizationTerms/OrganizationTerms")
);
const OrdersFilterContainer = lazy(
  () => import("./pages/OrdersFilter/OrdersFilterContainer")
);

const queryClient = new QueryClient();

function App() {
  const {
    phone,
    city,
    pvzId,
    formType,
    disableName,
    isAuthenticated,
    initialCar,
    initialVin,
    initialPartName,
    initialDeliveryType,
    initialTransportCompanyId,
    firstName,
    lastName,
    initialCarModel,
    initialCarYear,
  } = useMemo(() => getTelegramData(), []);

  const {
    initialRegistrationType,
    initialOrderStatus,
    availableRegistrationTypes,
    initialStartDate,
    initialEndDate,
  } = useMemo(() => getOrdersFilterTgData(), []);

  useEffect(() => {
    expandWebapp();
  }, []);

  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loading />}>
          {formType === "personalData" && (
            <PersonalDataContainer
              phone={phone}
              city={city}
              pvzId={pvzId}
              deliveryType={initialDeliveryType}
              firstName={firstName}
              lastName={lastName}
            />
          )}
          {formType === "vinRequest" && (
            <VinRequestContainer
              city={city}
              initialName={firstName}
              initialLastName={lastName}
              disableName={disableName}
              isAuthenticated={isAuthenticated}
              initialCar={initialCar}
              initialVin={initialVin}
              initialPartName={initialPartName}
              initialCarModel={initialCarModel}
              initialCarYear={initialCarYear}
            />
          )}
          {formType === "organizationTerms" && city?.id !== undefined && (
            <OrganizationTerms
              cityId={city.id}
              pvzId={pvzId ?? ""}
              deliveryType={initialDeliveryType ?? "pickup"}
              transportCompanyId={initialTransportCompanyId}
            />
          )}
          {formType === "ordersFilter" && (
            <OrdersFilterContainer
              initialRegistrationType={initialRegistrationType}
              initialOrderStatus={initialOrderStatus}
              availableRegistrationTypes={
                availableRegistrationTypes as RegistrationType[]
              }
              initialStartDate={initialStartDate}
              initialEndDate={initialEndDate}
            />
          )}
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function str(value: string | null | undefined) {
  if (value == null) return undefined;
  return String(value).replaceAll("%20", " ");
}

function number<T extends number | undefined>(
  value: string | null | undefined,
  defaultValue: T
): number | T {
  const _value = value ? parseInt(String(value), 10) : defaultValue;
  return _value !== undefined && isFinite(_value) ? _value : defaultValue;
}

/**
 * Получение параметра: сначала из URL, затем из payload OpenAppButton.
 */
function param(urlParams: URLSearchParams, payload: Record<string, unknown>, key: string): string | null {
  return urlParams.get(key) ?? (payload[key] != null ? String(payload[key]) : null);
}

function getOrdersFilterTgData() {
  const urlParams = new URLSearchParams(window.location.search);
  const payload = getLaunchPayload();
  const initialRegistrationType = str(param(urlParams, payload, "registrationType")) as
    | RegistrationType
    | undefined;
  const initialOrderStatus = str(param(urlParams, payload, "orderStatus")) as
    | PersonalOrderStatusType
    | ManagerOrderStatusType
    | undefined;
  const rawTypes = str(param(urlParams, payload, "availableRegistrationTypes"));
  const availableRegistrationTypes = rawTypes?.split(",") ?? [];
  const startDateRaw = param(urlParams, payload, "startDate");
  const initialStartDate = startDateRaw ? new Date(startDateRaw) : undefined;
  const endDateRaw = param(urlParams, payload, "endDate");
  const initialEndDate = endDateRaw ? new Date(endDateRaw) : undefined;
  return {
    initialRegistrationType,
    initialOrderStatus,
    availableRegistrationTypes,
    initialStartDate,
    initialEndDate,
  };
}

function getTelegramData() {
  const urlParams = new URLSearchParams(window.location.search);
  const payload = getLaunchPayload();
  const formType = str(param(urlParams, payload, "formType"));
  const phone = str(param(urlParams, payload, "phone")) ?? "";
  const cityId = parseInt(String(param(urlParams, payload, "cityId") ?? "0"), 10);
  const cityName = str(param(urlParams, payload, "cityName")) ?? "";
  const pvzId = str(param(urlParams, payload, "pvzId")) ?? undefined;
  const firstName = str(param(urlParams, payload, "firstName")) ?? undefined;
  const lastName = str(param(urlParams, payload, "lastName")) ?? undefined;
  const disableNameRaw = payload["disableName"];
  const disableName = param(urlParams, payload, "disableName") === "true" || disableNameRaw === true;
  const isAuthRaw = payload["isAuthenticated"];
  const isAuthenticated = param(urlParams, payload, "isAuthenticated") === "true" || isAuthRaw === true;
  const initialCar = str(param(urlParams, payload, "car")) ?? undefined;
  const initialVin = str(param(urlParams, payload, "vin")) ?? undefined;
  const initialPartName = str(param(urlParams, payload, "partName")) ?? undefined;
  const initialCarModel = str(param(urlParams, payload, "carModel")) ?? undefined;
  const initialCarYear = number(param(urlParams, payload, "carYear"), undefined);
  const initialDeliveryType = str(param(urlParams, payload, "deliveryType")) as
    | DeliveryType
    | undefined;
  const initialTransportCompanyId = number(
    param(urlParams, payload, "transportCompanyId"),
    0
  );
  const city = cityId ? { id: cityId, name: cityName } : undefined;
  return {
    phone,
    city,
    pvzId,
    formType,
    firstName,
    lastName,
    disableName,
    isAuthenticated,
    initialCar,
    initialVin,
    initialPartName,
    initialCarModel,
    initialCarYear,
    initialDeliveryType,
    initialTransportCompanyId,
  };
}

export default App;
