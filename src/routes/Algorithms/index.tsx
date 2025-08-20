import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/Algorithms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Algorithms"!</div>
}
