import { createFileRoute } from "@tanstack/react-router";
import {Algorithms} from "@/types";
import {Header} from "@/components/Header";

export const Route = createFileRoute("/algorithms/sorting/quickSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header selectedAlgorithm={Algorithms.QuickSort} />
    </div>
  );
}
