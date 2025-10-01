import * as React from "react";
import {
  createFileRoute,
  Link,
  useRouterState,
  Outlet,
} from "@tanstack/react-router";
import { AppBar, Tabs, Tab, Box } from "@mui/material";

export const Route = createFileRoute("/algorithms/sorting")({
  component: SortingLayout,
});

function SortingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = pathname.replace(/\/+$/, "");

  const tabsValue =
    current === "/algorithms/sorting" ? "/algorithms/sorting" : current;

  return (
    <Box>
      <AppBar
        position="sticky"
        color="default"
        elevation={2}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Tabs value={tabsValue} centered>
          <Tab
            label="Overview"
            value="/algorithms/sorting"
            component={Link}
            to="/algorithms/sorting"
          />
          <Tab
            label="Selection Sort"
            value="/algorithms/sorting/selectionSort"
            component={Link}
            to="/algorithms/sorting/selectionSort"
          />
          <Tab
            label="Bubble Sort"
            value="/algorithms/sorting/bubbleSort"
            component={Link}
            to="/algorithms/sorting/bubbleSort"
          />
          <Tab
            label="Quick Sort"
            value="/algorithms/sorting/quickSort"
            component={Link}
            to="/algorithms/sorting/quickSort"
          />
          <Tab
            label="Insertion Sort"
            value="/algorithms/sorting/insertionSort"
            component={Link}
            to="/algorithms/sorting/insertionSort"
          />
          <Tab
            label="Merge Sort"
            value="/algorithms/sorting/mergeSort"
            component={Link}
            to="/algorithms/sorting/mergeSort"
          />
        </Tabs>
      </AppBar>
      
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
