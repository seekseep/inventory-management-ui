import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AppBreadcrumbs } from '#/components/AppBreadcrumbs'
import { AppSidebar } from '#/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { isAuthenticated } from '#/lib/auth'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-6">
          <AppBreadcrumbs />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
