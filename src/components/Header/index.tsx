import type {Algorythms} from "@/types";
import {descriptions, type HeaderProps} from "@/components/Header/descriptions.ts";
import React from "react";
import {Chip, Stack} from "@mui/material";

export const Header: React.FC<{selectedAlgorithm: Algorythms}> = ({selectedAlgorithm}) => {

  const selected: HeaderProps = React.useMemo(() => descriptions[selectedAlgorithm], [selectedAlgorithm]);

  return (
  <Stack direction="column" alignItems="flex-start" gap={1}>
    <h1>{selected.title}</h1>
    <p>{selected.description}</p>
    <Stack direction="row" spacing={2}>
      <Chip label="Complexity" color="success" />
      {Object.entries(selected.complexity).map(([scenario, complexity]) => (
        <Chip label={`${scenario}: ${complexity}`}  />
      ))}
    </Stack>

  </Stack>
  );

}