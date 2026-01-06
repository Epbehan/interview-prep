import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Algorithms } from "@/types";
import QuickSortVisualizer from "@/components/algorithmVisualizer/quickSortVisualizer";

function QuickSortPage() {
  return (
    <div>
      <Header selectedAlgorithm={Algorithms.QuickSort} />
      <QuickSortVisualizer />
    </div>
  );
}

export const Route = createFileRoute("/algorithms/sorting/quickSort")({
  component: QuickSortPage,
});
