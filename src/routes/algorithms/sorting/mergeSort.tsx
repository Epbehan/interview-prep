import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting/mergeSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h3>Merge Sort</h3>
      <p>
        Merge Sort is a divide-and-conquer algorithm that splits the list into
        halves, recursively sorts each half, and then merges the sorted halves
        back together. By repeatedly breaking the list down and merging in
        order, the algorithm efficiently produces a fully sorted list.
      </p>
    </div>
  );
}
