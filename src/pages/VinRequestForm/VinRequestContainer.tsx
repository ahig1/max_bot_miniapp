import { useCallback } from "react";
import { City } from "../../api/city";
import { VinRequestForm } from "./VinRequestForm";
import { VinRequestData } from "./VinRequestModel";
import { sendDataToBot } from "../../api/telegram";

export interface VinRequestContainerProps {
  city?: City;
  initialName?: string;
  initialLastName?: string;
  disableName?: boolean;
  isAuthenticated?: boolean;
  initialCar?: string;
  initialCarModel?: string;
  initialCarYear?: number;
  initialVin?: string;
  initialPartName?: string;
}

export function VinRequestContainer({
  city,
  initialName,
  initialLastName,
  disableName,
  isAuthenticated,
  initialCar,
  initialVin,
  initialPartName,
  initialCarModel,
  initialCarYear,
}: VinRequestContainerProps) {
  const handleSubmit = useCallback(async (data: VinRequestData) => {
    await sendDataToBot(data);
  }, []);
  return (
    <VinRequestForm
      initialCity={city}
      initialCar={initialCar}
      initialVin={initialVin}
      initialPartName={initialPartName}
      initialName={initialName}
      initialLastName={initialLastName}
      initialCarModel={initialCarModel}
      initialCarYear={initialCarYear}
      disableName={disableName}
      isAuthenticated={isAuthenticated}
      onSubmit={handleSubmit}
    />
  );
}

export default VinRequestContainer;
