import React, { useCallback, useState } from "react";
import { TextField, Button, FormControl } from "@mui/material";
import { VinRequestData } from "./VinRequestModel";
import { City } from "../../api/city";
import { CitySelect } from "../../components/CitySelect/CitySelect";

interface VinRequestFormProps {
  initialCity?: City;
  initialCar?: string;
  initialVin?: string;
  initialPartName?: string;
  initialName?: string;
  initialLastName?: string;
  initialCarModel?: string;
  initialCarYear?: number;
  disableName?: boolean;
  isAuthenticated?: boolean;
  onSubmit: (data: VinRequestData) => void;
}

function VinRequestForm_({
  initialCity,
  initialCar,
  initialVin: initialVinOrFrame,
  initialPartName,
  initialName,
  initialLastName,
  initialCarModel,
  initialCarYear,
  disableName,
  isAuthenticated,
  onSubmit,
}: VinRequestFormProps) {
  const [name, setName] = useState<string>(initialName ?? "");
  const [lastName, setLastName] = useState<string>(initialLastName ?? "");
  const [car, setCar] = useState<string>(initialCar ?? "");
  const [vinOrFrame, setVinOrFrame] = useState<string>(initialVinOrFrame ?? "");
  const [partName, setPartName] = useState<string>(initialPartName ?? "");
  const [city, setCity] = useState<City | null>(initialCity ?? null);
  const [carModel, setCarModel] = useState<string>(initialCarModel ?? "");
  const [carYear, setCarYear] = useState<number | undefined>(initialCarYear ?? undefined);

  const isValidVinFrame = (code: string): boolean => {
    if (!code) return true;
    // const sanitizedCode = code.replace(/-/g, "");
    const regex = /^[a-zA-Z0-9-]{5,18}$/;
    return regex.test(code);
  };

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      if (vinOrFrame.trim() && !isValidVinFrame(vinOrFrame)) {
        alert("Пожалуйста, введите корректный VIN/Frame код (5-18 символов, буквы, цифры, дефисы).");
        return;
      }

      if (!partName || (!isAuthenticated && !city)) {
        const missingFields = [];
        if (!partName) missingFields.push("Деталь");
        if (!isAuthenticated && !city) missingFields.push("Город");
        alert(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(", ")}.`);
        return;
      }
      onSubmit({
        firstName: name,
        lastName,
        car,
        vin: vinOrFrame.length === 17 ? vinOrFrame.toUpperCase() : "",
        frame: vinOrFrame.length < 17 ? vinOrFrame.toUpperCase() : "",
        partName,
        cityId: city?.id ?? 0,
        cityName: city?.name ?? '',
        carModel,
        carYear,
      });
    },
    [vinOrFrame, partName, city, onSubmit, name, lastName, car, carModel, carYear, isAuthenticated]
  );

  const [vinTouched, setVinTouched] = useState(false);
  const handleVinBlur = useCallback(() => {
    setVinTouched(true);
  }, []);
  const hasVinError = vinTouched && vinOrFrame !== "" && !isValidVinFrame(vinOrFrame);

  return (
    <form
      style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Марка автомобиля"
        value={car}
        onChange={(e) => setCar(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      {!isAuthenticated && (
        <FormControl fullWidth margin="normal" variant="outlined" required>
          <CitySelect value={city} onChange={setCity} />
        </FormControl>
      )}
      <TextField
        label="Модель автомобиля"
        value={carModel}
        onChange={(e) => setCarModel(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField
        label="Год выпуска автомобиля"
        value={carYear}
        onChange={(e) => {
          const yearValue = e.target.value;
          if (yearValue === "") {
            setCarYear(undefined)
          } else if (/^\d*$/.test(yearValue) && yearValue.length <= 4) {
            setCarYear(parseInt(yearValue));
          }
        }}
        variant="outlined"
        fullWidth
        margin="normal"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
      />
      <TextField
        label="VIN/Frame код"
        value={vinOrFrame}
        onChange={(e) => setVinOrFrame(e.target.value.toUpperCase())}
        variant="outlined"
        fullWidth
        margin="normal"
        error={hasVinError}
        helperText={hasVinError ? "Введите корректный VIN/Frame код (5-18 симв.)" : ""}
        onBlur={handleVinBlur}
      />
      {!isAuthenticated && (
        <TextField
          required
          label="Имя"
          disabled={disableName}
          placeholder={"Нужно добавить имя"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      )}
      {!isAuthenticated && (
        <TextField
          required
          label="Фамилия"
          disabled={disableName}
          placeholder={"Нужно добавить фамилию"}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      )}
      <TextField
        required
        label="Деталь"
        value={partName}
        onChange={(e) => setPartName(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        fullWidth
        style={{ marginTop: "20px" }}
      >
        Сформировать
      </Button>
    </form>
  );
}

export const VinRequestForm = React.memo(VinRequestForm_);
