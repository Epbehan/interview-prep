// src/routes/algorithms/sorting/mergeSort.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Algorithms } from "@/types";
import { Header } from "@/components/Header";
import MergeSortVisualizer from "@/components/algorithmVisualizer/mergeSortVisualizer";

export const Route = createFileRoute("/algorithms/sorting/mergeSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header selectedAlgorithm={Algorithms.MergeSort} />
      <MergeSortVisualizer />
    </div>
  );
}
