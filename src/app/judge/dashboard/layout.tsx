
"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  LogOut,
  Rocket,
  Bell,
  User
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function JudgeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "authToken=; path=/; max-age=0";
    router.push("/hackathons");
    router.refresh();
  }

  const menuItems = [
    { href: "/judge/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="border-r border-border/20">
          <SidebarContent className="p-4 flex flex-col">
            <SidebarHeader className="p-0">
               <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <Rocket className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold font-headline">HackHub</h2>
                </Link>
              </div>
            </SidebarHeader>
            <SidebarMenu className="mt-8 flex-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                   <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="text-base h-11 justify-start"
                      tooltip={{
                        children: item.label,
                        side: "right",
                        align: "center",
                      }}
                    >
                      <span>
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
             <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                  <div className="flex items-center justify-between p-2 w-full">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Judge"/>
                        <AvatarFallback>J</AvatarFallback>
                      </Avatar>
                      <div className="group-data-[collapsible=icon]:hidden">
                          <p className="font-semibold">Judge</p>
                          <p className="text-xs text-muted-foreground">judge@example.com</p>
                      </div>
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Bell className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end">
                           <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem>You have been invited to judge "AI Innovation Challenge".</DropdownMenuItem>
                           <DropdownMenuItem>Submissions for "Sustainable Solutions" are now open for judging.</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <Link href="/judge/profile">
                    <SidebarMenuButton
                      isActive={pathname === "/judge/profile"}
                      className="text-base h-11 justify-start"
                       tooltip={{
                          children: "Profile",
                          side: "right",
                          align: "center",
                        }}>
                      <User className="h-5 w-5"/>
                      <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                  </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}
                    className="text-base h-11 justify-start"
                    tooltip={{
                          children: "Logout",
                          side: "right",
                          align: "center",
                        }}>
                      <LogOut className="h-5 w-5"/>
                      <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <div className="p-4 sm:p-6 lg:p-8">
             {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
