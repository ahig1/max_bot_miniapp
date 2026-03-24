import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect, useMemo } from "react";
import { expandWebapp } from "./api/telegram";
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

function str(value: string | null) {
  return value?.replaceAll("%20", " ");
}

function number<T extends number | undefined>(
  value: string | null,
  defaultValue: T
): number | T {
  const _value = value ? parseInt(value, 10) : defaultValue;
  return _value !== undefined && isFinite(_value) ? _value : defaultValue;
}

function getOrdersFilterTgData() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRegistrationType = str(urlParams.get("registrationType")) as
    | RegistrationType
    | undefined;
  const initialOrderStatus = str(urlParams.get("orderStatus")) as
    | PersonalOrderStatusType
    | ManagerOrderStatusType
    | undefined;
  const availableRegistrationTypes =
    str(urlParams.get("availableRegistrationTypes"))?.split(",") ?? [];
  const initialStartDate = urlParams.get("startDate")
    ? new Date(urlParams.get("startDate")!)
    : undefined;
  const initialEndDate = urlParams.get("endDate")
    ? new Date(urlParams.get("endDate")!)
    : undefined;
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
  const formType = str(urlParams.get("formType"));
  const phone = str(urlParams.get("phone")) ?? "";
  const cityId = parseInt(urlParams.get("cityId") ?? "0", 10);
  const cityName = str(urlParams.get("cityName")) ?? "";
  const pvzId = str(urlParams.get("pvzId")) ?? undefined;
  const firstName = str(urlParams.get("firstName")) ?? undefined;
  const lastName = str(urlParams.get("lastName")) ?? undefined;
  const disableName = urlParams.get("disableName") === "true";
  const isAuthenticated = urlParams.get("isAuthenticated") === "true";
  const initialCar = str(urlParams.get("car")) ?? undefined;
  const initialVin = str(urlParams.get("vin")) ?? undefined;
  const initialPartName = str(urlParams.get("partName")) ?? undefined;
  const initialCarModel = str(urlParams.get("carModel")) ?? undefined;
  const initialCarYear = number(urlParams.get("carYear"), undefined);
  const initialDeliveryType = str(urlParams.get("deliveryType")) as
    | DeliveryType
    | undefined;
  const initialTransportCompanyId = number(
    urlParams.get("transportCompanyId"),
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
