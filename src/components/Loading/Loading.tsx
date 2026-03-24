import React from 'react';
import { CircularProgress, Box } from '@mui/material';

function Loading_() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}

export const Loading = React.memo(Loading_);
