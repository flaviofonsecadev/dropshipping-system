"use client"

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Home,
  LayoutDashboard,
  Package,
  Palette,
  ShoppingCart,
  Store,
  Users,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"
import { logoutAction } from "@/app/login/actions"

const allNavItems = [
  {
    title: "Início",
    url: "/",
    icon: Home,
    roles: ["all"],
  },
  {
    title: "Painel",
    url: "/supplier",
    icon: LayoutDashboard,
    roles: ["supplier", "admin"],
  },
  {
    title: "Catálogo",
    url: "/supplier/products",
    icon: Package,
    roles: ["supplier", "admin"],
  },
  {
    title: "Pedidos",
    url: "/supplier/orders",
    icon: ShoppingCart,
    roles: ["supplier", "admin"],
  },
  {
    title: "Parceiros",
    url: "/supplier/resellers",
    icon: Users,
    roles: ["supplier", "admin"],
  },
  {
    title: "Painel",
    url: "/reseller",
    icon: LayoutDashboard,
    roles: ["reseller", "admin"],
  },
  {
    title: "Loja",
    url: "/reseller/store",
    icon: Store,
    roles: ["reseller", "admin"],
  },
  {
    title: "Visual",
    url: "/reseller/settings/visual",
    icon: Palette,
    roles: ["reseller", "admin"],
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    email: string
    role: string
  } | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Se não estiver logado, exibe apenas "all" (Início)
  // Se logado, exibe os links compatíveis com a role
  const filteredNavItems = allNavItems.filter((item) => {
    if (!user) return item.roles.includes("all")
    if (user.role === "admin") return true // Admin vê tudo, mas talvez sem duplicação de 'Painel'
    return item.roles.includes("all") || item.roles.includes(user.role)
  })

  return (
    <Sidebar variant="sidebar" className="dark bg-zinc-950 text-zinc-50 border-r-zinc-800" {...props}>
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingCart className="size-4" />
          </div>
          <span>DropSystem</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-4">
          {filteredNavItems.map((item, index) => (
            <SidebarMenuItem key={`${item.title}-${index}`}>
              <SidebarMenuButton tooltip={item.title} className="hover:bg-zinc-800 hover:text-zinc-50" render={<Link href={item.url} />}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-800 p-4">
        {user ? (
          <div className="flex items-center justify-between w-full">
            <Link href="/profile" className="flex items-center gap-2 hover:bg-zinc-800 p-1 rounded-md transition-colors flex-1 overflow-hidden">
              <div className="size-8 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="size-4 text-zinc-400" />
              </div>
              <div className="flex flex-col text-sm truncate">
                <span className="font-medium truncate">{user.email.split('@')[0]}</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wider">{user.role}</span>
              </div>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 rounded-md transition-colors"
                title="Sair"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Fazer Login
            </Link>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
