import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import React, { useState } from "react";
import { City, useCities } from "../../api/city";
import { convertToRussianLayout } from "../../utils/keyboard";

export interface CitySelectProps {
  value: City | null;
  onChange: (value: City | null) => void;
}

function CitySelect_({ value, onChange }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value?.name ?? "");

  const { data: cities = [], isLoading } = useCities(convertToRussianLayout(query));

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(_, value) => {
        setQuery(value);
      }}
      value={value}
      onChange={(_, value) => {
        onChange(value);
      }}
      getOptionLabel={(option) => option.name}
      options={cities}
      loading={isLoading}
      filterOptions={(options) => options}
      loadingText="Поиск города..."
      noOptionsText={
        query.length < 3 ? "Введите минимум 3 символа" : "Нет доступных городов"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label="Город"
          variant="outlined"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export const CitySelect = React.memo(CitySelect_);
