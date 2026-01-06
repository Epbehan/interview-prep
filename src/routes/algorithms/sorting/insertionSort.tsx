import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Algorithms } from "@/types";
import InsertionSortVisualizer from "@/components/algorithmVisualizer/insertionSortVisualizer";

function InsertionSortPage() {
  return (
    <div>
      <Header selectedAlgorithm={Algorithms.InsertionSort} />
      <InsertionSortVisualizer />
    </div>
  );
}

export const Route = createFileRoute("/algorithms/sorting/insertionSort")({
  component: InsertionSortPage,
});
