import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting/insertionSort")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h3>Insertion Sort</h3>
      <p>
        Insertion Sort builds the sorted list one item at a time by taking each
        new element and inserting it into its correct position among the already
        sorted elements. This process repeats until all elements are placed,
        making it simple and efficient for small or nearly sorted lists.
      </p>
    </div>
  );
}
