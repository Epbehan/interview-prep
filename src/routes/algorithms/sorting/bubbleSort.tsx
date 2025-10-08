import { createFileRoute } from "@tanstack/react-router";
import {Header} from "@/components/Header";
import {Algorithms} from "@/types";

function BubbleSortPage() {
  return (
    <div>
     <Header selectedAlgorithm={Algorithms.BubbleSort} />
    </div>
  );
}

export const Route = createFileRoute("/algorithms/sorting/bubbleSort")({
  component: BubbleSortPage,
});
