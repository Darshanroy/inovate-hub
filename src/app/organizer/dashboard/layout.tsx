"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
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
  LogOut
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
        <Sidebar>
          <SidebarContent className="p-2">
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="Organizer"/>
                  <AvatarFallback>O</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                    <p className="font-semibold">Organizer</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{
                        children: item.label,
                        side: "right",
                        align: "center",
                      }}
                    >
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
               <LogOut className="h-4 w-4"/>
               <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          </SidebarFooter>
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
