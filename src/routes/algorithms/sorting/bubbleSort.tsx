import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Algorithms } from "@/types";
import BubbleSortVisualizer from "@/components/algorithmVisualizer/bubbleSortVisualizer";

function BubbleSortPage() {
  return (
    <div>
      <Header selectedAlgorithm={Algorithms.BubbleSort} />
      <BubbleSortVisualizer />
    </div>
  );
}

export const Route = createFileRoute("/algorithms/sorting/bubbleSort")({
  component: BubbleSortPage,
});
