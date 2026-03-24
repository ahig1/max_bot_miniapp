import { useCallback, useEffect, useState } from "react";
import { City } from "../../api/city";
import { fetchPvz, PvzEntry } from "../../api/pvz";
import { PersonalDataForm } from "./PersonalDataForm";
import { Loading } from "../../components/Loading/Loading";
import { DeliveryType, PersonalData } from "./PersonalDataModel";
import { sendDataToBot } from "../../api/telegram";

export interface PersonalDataFormContainerProps {
  city?: City;
  pvzId?: string;
  deliveryType?: DeliveryType;
  phone: string;
  firstName?: string;
  lastName?: string;
}

export function PersonalDataContainer({
  city,
  pvzId,
  deliveryType,
  phone,
  firstName,
  lastName,
}: PersonalDataFormContainerProps) {
  const [isLoading, setIsLoading] = useState(
    pvzId !== undefined && city !== undefined
  );
  const [loadedPvz, setLoadedPvz] = useState<PvzEntry | undefined>(undefined);

  useEffect(() => {
    if (pvzId && city) {
      fetchPvz(city.id, deliveryType).then((pvzs) => {
        setLoadedPvz(pvzs.find((p) => p.id === pvzId));
        setIsLoading(false);
      });
    }
  }, [pvzId, city, deliveryType]);

  const handleSubmit = useCallback(async (data: PersonalData) => {
    await sendDataToBot(data);
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <PersonalDataForm
      initialCity={city}
      initialPvz={loadedPvz}
      initialFirstName={firstName}
      initialLastName={lastName}
      initialDeliveryType={deliveryType}
      phone={phone}
      onSubmit={handleSubmit}
    />
  );
}

export default PersonalDataContainer;
