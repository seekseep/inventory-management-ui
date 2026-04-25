import { Link, useMatches } from '@tanstack/react-router'
import {
  ArrowRightLeft,
  Boxes,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  MapPin,
  Package,
  Warehouse,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/item-categories', label: 'カテゴリ', icon: FolderTree },
  { to: '/items', label: '商品', icon: Package },
  { to: '/item-variants', label: 'バリアント', icon: Boxes },
  { to: '/locations', label: 'ロケーション', icon: MapPin },
  { to: '/inventories', label: '在庫', icon: Warehouse },
  { to: '/transactions', label: '取引', icon: ArrowRightLeft },
  { to: '/snapshots', label: '棚卸', icon: ClipboardList },
] as const

export function AppSidebar() {
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? '/'

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <h1 className="text-lg font-bold">在庫管理</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.to === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(item.to)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
