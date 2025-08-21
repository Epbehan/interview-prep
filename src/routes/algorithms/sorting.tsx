import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/algorithms/sorting")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/Algorithms/sorting"!</div>;
}
