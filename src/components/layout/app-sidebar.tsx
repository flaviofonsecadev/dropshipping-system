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
import { Home, Package, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Início",
      url: "/",
      icon: Home,
    },
    {
      title: "Fornecedor - Dashboard",
      url: "/supplier",
      icon: Package,
    },
    {
      title: "Fornecedor - Produtos",
      url: "/supplier/products",
      icon: Package,
    },
    {
      title: "Fornecedor - Pedidos",
      url: "/supplier/orders",
      icon: ShoppingCart,
    },
    {
      title: "Fornecedor - Revendedores",
      url: "/supplier/resellers",
      icon: Users,
    },
    {
      title: "Revendedor",
      url: "/reseller",
      icon: ShoppingCart,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} className="hover:bg-zinc-800 hover:text-zinc-50" render={<Link href={item.url} />}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center">
            <Users className="size-4 text-zinc-400" />
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-medium">Usuário Teste</span>
            <span className="text-xs text-zinc-400">admin@dropsystem.com</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
