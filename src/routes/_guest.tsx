import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '#/lib/auth'

export const Route = createFileRoute('/_guest')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: GuestLayout,
})

function GuestLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Outlet />
    </div>
  )
}
