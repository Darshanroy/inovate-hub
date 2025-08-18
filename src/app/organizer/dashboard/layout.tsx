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
  Home,
  PlusCircle,
  Users,
  FileText,
  Award,
  BarChart,
  LogOut,
  Rocket
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function OrganizerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "isLoggedIn=; path=/; max-age=0";
    document.cookie = "userType=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  }

  const menuItems = [
    { href: "/organizer/dashboard", label: "Dashboard", icon: Home },
    {
      href: "/organizer/dashboard/create",
      label: "Create Hackathon",
      icon: PlusCircle,
    },
    {
      href: "/organizer/dashboard/participants",
      label: "Participants",
      icon: Users,
    },
    {
      href: "/organizer/dashboard/submissions",
      label: "Submissions",
      icon: FileText,
    },
    {
      href: "/organizer/dashboard/judging",
      label: "Judging Panel",
      icon: Award,
    },
    {
      href: "/organizer/dashboard/results",
      label: "Results",
      icon: BarChart,
    },
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
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      className="text-base h-11 justify-start"
                      tooltip={{
                        children: item.label,
                        side: "right",
                        align: "center",
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
             <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                  <div className="flex items-center gap-3 p-2">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/40x40.png" alt="Organizer"/>
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <p className="font-semibold">Organizer</p>
                        <p className="text-xs text-muted-foreground">organizer@example.com</p>
                    </div>
                  </div>
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
