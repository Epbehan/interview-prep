import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting/quickSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h3>Quick Sort</h3>
      <p>
        Quick Sort is a fast divide-and-conquer algorithm that selects a "pivot"
        element, partitions the list into items less than and greater than the
        pivot, and then recursively sorts the partitions. The partitions and
        recombinations continue until the entire list is sorted.
      </p>
    </div>
  );
}
