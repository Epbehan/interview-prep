import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/algorithms/searching')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/algorithms/searching"!</div>
}
