import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  City,
  useCityDeliveryMethods,
  useCityTransportCompanies,
} from "../../api/city";
import { CitySelect } from "../../components/CitySelect/CitySelect";
import {
  deliveryOptions,
  DeliveryType,
  PersonalData,
} from "./PersonalDataModel";
import { PvzEntry } from "../../api/pvz";
import { PvzSelect } from "../../components/PvzSelect/PvzSelect";

export interface PersonalDataFormProps {
  phone: string;
  initialCity?: City;
  initialPvz?: PvzEntry;
  initialFirstName?: string;
  initialLastName?: string;
  initialDeliveryType?: DeliveryType;
  transportCompanyId?: number;
  onSubmit: (data: PersonalData) => void;
}

function PersonalDataForm_({
  phone,
  initialCity,
  initialPvz,
  initialFirstName,
  initialLastName,
  initialDeliveryType,
  onSubmit,
}: PersonalDataFormProps) {
  const [name, setName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    initialDeliveryType ?? "pickup"
  );
  const [city, setCity] = useState<City | null>(initialCity ?? null);
  const [pvz, setPvz] = useState<PvzEntry | null>(initialPvz ?? null);

  const { data: availableDeliveryTypes = [] } = useCityDeliveryMethods(
    city?.id
  );

  useEffect(() => {
    if (
      availableDeliveryTypes.length > 0 &&
      !availableDeliveryTypes.includes(deliveryType)
    ) {
      setDeliveryType(availableDeliveryTypes[0]);
    }
  }, [availableDeliveryTypes, deliveryType]);

  const { data: transportCompanies = [] } = useCityTransportCompanies(city?.id);
  const selectedTransportCompany =
    deliveryType === "courier" || deliveryType === "pickupPartner"
      ? transportCompanies[0]
      : undefined;

  const isDisabled =
    name.trim() === "" || lastName.trim() === "" || !city || !deliveryType;

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!isDisabled) {
        onSubmit({
          name: name.trim(),
          lastName: lastName.trim(),
          deliveryType,
          pvzId: pvz?.id,
          pvzName: pvz?.label,
          cityId: city.id,
          cityName: city.name,
          transportCompanyId: selectedTransportCompany?.id,
        });
      } else {
        alert("Пожалуйста, заполните все обязательные поля");
      }
    },
    [
      isDisabled,
      onSubmit,
      name,
      lastName,
      deliveryType,
      pvz?.id,
      pvz?.label,
      city?.id,
      city?.name,
      selectedTransportCompany?.id,
    ]
  );

  const handleCityChange = useCallback(
    (newCity: City | null) => {
      setCity(newCity);
      if (newCity?.id !== city?.id) {
        setPvz(null);
      }
    },
    [city]
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}
    >
      <TextField
        label="Телефон"
        variant="outlined"
        fullWidth
        disabled
        margin="normal"
        defaultValue={phone}
      />
      <TextField
        label="Имя"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        label="Фамилия"
        variant="outlined"
        fullWidth
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        margin="normal"
        required
      />
      <FormControl fullWidth margin="normal" required>
        <CitySelect value={city} onChange={handleCityChange} />
      </FormControl>
      {city && (
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Способ получения</InputLabel>
          <Select
            label="Способ получения"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
          >
            {deliveryOptions.filter((option) =>
              availableDeliveryTypes.includes(option.type)
            ).length > 0 ? (
              deliveryOptions
                .filter((option) =>
                  availableDeliveryTypes.includes(option.type)
                )
                .map((option) => (
                  <MenuItem key={option.type} value={option.type}>
                    {option.label}
                  </MenuItem>
                ))
            ) : (
              <MenuItem disabled>Нет доступных способов получения</MenuItem>
            )}
          </Select>
        </FormControl>
      )}
      {selectedTransportCompany && (
        <TextField
          label="ТК"
          variant="outlined"
          fullWidth
          disabled
          margin="normal"
          value={selectedTransportCompany.title}
        />
      )}
      {deliveryType !== "courier" &&
        availableDeliveryTypes.includes(deliveryType) && (
          <FormControl fullWidth margin="normal" required>
            <PvzSelect
              cityId={city?.id}
              value={pvz}
              deliveryMethod={deliveryType}
              onChange={setPvz}
            />
          </FormControl>
        )}
      <Button
        type="submit"
        variant="contained"
        disabled={isDisabled}
        color="primary"
        fullWidth
        style={{ marginTop: "20px" }}
      >
        Сохранить
      </Button>
    </form>
  );
}

export const PersonalDataForm = React.memo(PersonalDataForm_);
