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
          {!formType && (
            <div style={{color:'white',padding:20,fontSize:14,wordBreak:'break-all'}}>
              <p>DEBUG: formType is empty</p>
              <p>search: {window.location.search}</p>
              <p>hash: {window.location.hash}</p>
              <p>WebApp.initData: {window.WebApp?.initData || 'N/A'}</p>
              <p>WebApp.initDataUnsafe: {JSON.stringify(window.WebApp?.initDataUnsafe || {})}</p>
              <p>WebApp.payload: {window.WebApp?.payload || 'N/A'}</p>
              <p>Telegram.initData: {window.Telegram?.WebApp?.initData || 'N/A'}</p>
            </div>
          )}
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
 * Получение параметров: из URL query (?), hash fragment (#), и payload из initData.
 * Payload — base64url-encoded JSON, передаётся через OpenAppButton в Max.
 */
function getParams(): URLSearchParams {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const payload = getLaunchPayload();

  // Merge: hash params fill in anything missing from search params
  for (const [key, value] of hashParams) {
    if (!searchParams.has(key)) {
      searchParams.set(key, value);
    }
  }
  // Merge: payload fills in anything still missing
  for (const [key, value] of Object.entries(payload)) {
    if (!searchParams.has(key) && value != null) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams;
}

function getOrdersFilterTgData() {
  const params = getParams();
  const initialRegistrationType = str(params.get("registrationType")) as
    | RegistrationType
    | undefined;
  const initialOrderStatus = str(params.get("orderStatus")) as
    | PersonalOrderStatusType
    | ManagerOrderStatusType
    | undefined;
  const availableRegistrationTypes =
    str(params.get("availableRegistrationTypes"))?.split(",") ?? [];
  const initialStartDate = params.get("startDate")
    ? new Date(params.get("startDate")!)
    : undefined;
  const initialEndDate = params.get("endDate")
    ? new Date(params.get("endDate")!)
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
  const params = getParams();
  const formType = str(params.get("formType"));
  const phone = str(params.get("phone")) ?? "";
  const cityId = parseInt(params.get("cityId") ?? "0", 10);
  const cityName = str(params.get("cityName")) ?? "";
  const pvzId = str(params.get("pvzId")) ?? undefined;
  const firstName = str(params.get("firstName")) ?? undefined;
  const lastName = str(params.get("lastName")) ?? undefined;
  const disableName = params.get("disableName") === "true";
  const isAuthenticated = params.get("isAuthenticated") === "true";
  const initialCar = str(params.get("car")) ?? undefined;
  const initialVin = str(params.get("vin")) ?? undefined;
  const initialPartName = str(params.get("partName")) ?? undefined;
  const initialCarModel = str(params.get("carModel")) ?? undefined;
  const initialCarYear = number(params.get("carYear"), undefined);
  const initialDeliveryType = str(params.get("deliveryType")) as
    | DeliveryType
    | undefined;
  const initialTransportCompanyId = number(
    params.get("transportCompanyId"),
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
