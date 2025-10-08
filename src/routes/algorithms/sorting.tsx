import { createFileRoute } from "@tanstack/react-router";
import {Header} from "@/components/Header";
import {Algorithms} from "@/types";



export const Route = createFileRoute("/algorithms/sorting")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>
    <Header selectedAlgorithm={Algorithms.SelectionSort}/>

  </div>;
}
