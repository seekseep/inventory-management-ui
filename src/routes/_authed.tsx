import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ApiKeyDialog } from '#/components/ApiKeyDialog'
import { AppBreadcrumbs } from '#/components/AppBreadcrumbs'
import { AppSidebar } from '#/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { isAuthenticated } from '#/lib/auth'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())

  return (
    <>
      <ApiKeyDialog
        open={!authenticated}
        onAuthenticated={() => setAuthenticated(true)}
      />
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
    </>
  )
}
