import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organigram")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/organigram"!</div>;
}
