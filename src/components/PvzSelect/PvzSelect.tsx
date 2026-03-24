import {
    Autocomplete,
    CircularProgress,
    TextField
} from "@mui/material";
import React, { useState } from "react";
import { PvzEntry, usePvzs } from "../../api/pvz";
import { DeliveryMethod } from "../../api/city";

export interface PvzSelectProps {
  cityId?: number;
  deliveryMethod: DeliveryMethod;
  value: PvzEntry | null;
  onChange: (value: PvzEntry | null) => void;
}

function PvzSelect_({ cityId, deliveryMethod, value, onChange }: PvzSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value?.label ?? "");
  const { data: pvzs = [], isLoading } = usePvzs(cityId, deliveryMethod);

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
      getOptionLabel={(option) => option.label}
      options={pvzs.filter((pvz) => pvz.label.toLowerCase().includes(query.toLowerCase()))}
      loading={isLoading}
      noOptionsText={"Нет доступных пунктов выдачи"}
      disabled={cityId === undefined}
      renderInput={(params) => (
        <TextField
          {...params}
          label="ПВЗ"
          required
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
            }
          }}
        />
      )}
    />
  );
}

export const PvzSelect = React.memo(PvzSelect_);
