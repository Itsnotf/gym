import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Dumbbell, Users, KeyIcon, LayoutGrid, User, Zap, Clock, ClipboardList, Banknote, Building2, Landmark, Layers, Ticket } from 'lucide-react';
import AppLogo from './app-logo';
import users from '@/routes/users';
import roles from '@/routes/roles';
import classTypes from '@/routes/class-types';
import trainers from '@/routes/trainers';
import members from '@/routes/members';
import classSessions from '@/routes/class-sessions';
import schedules from '@/routes/schedules';
import adminBookings from '@/routes/admin/bookings';
import adminPaymentTransactions from '@/routes/admin/payment-transactions';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const userManagement: NavItem[] = [
    {
        title: 'Users',
        href: users.index(),
        icon: User,
        permissions: ['users index'],
    },
    {
        title: 'Roles',
        href: roles.index(),
        icon: KeyIcon,
        permissions: ['roles index'],
    },
];

const gymManagement: NavItem[] = [
    {
        title: 'Class Types',
        href: classTypes.index(),
        icon: BookOpen,
        permissions: ['class_types index'],
    },
    {
        title: 'Trainers',
        href: trainers.index(),
        icon: Dumbbell,
        permissions: ['trainers index'],
    },
    {
        title: 'Members',
        href: members.index(),
        icon: Users,
        permissions: ['members index'],
    },
    {
        title: 'Class Sessions',
        href: classSessions.index(),
        icon: Zap,
        permissions: ['class_sessions index'],
    },
    {
        title: 'Schedules',
        href: schedules.index(),
        icon: Clock,
        permissions: ['schedules index'],
    },
    {
        title: 'Facilities',
        href: '/admin/facilities',
        icon: Building2,
        permissions: ['facilities index'],
    },
    {
        title: 'Packages',
        href: '/admin/packages',
        icon: Layers,
        permissions: ['packages index'],
    },
];

const operationsNavItems: NavItem[] = [
    {
        title: 'Bookings',
        href: adminBookings.index(),
        icon: ClipboardList,
        permissions: ['bookings review'],
    },
    {
        title: 'Payments',
        href: adminPaymentTransactions.index(),
        icon: Banknote,
        permissions: ['payments review'],
    },
    {
        title: 'Bank Accounts',
        href: '/admin/bank-accounts',
        icon: Landmark,
        permissions: ['bank_accounts index'],
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: Ticket,
        permissions: ['subscriptions review'],
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain section='Platform' items={mainNavItems} />
                <NavMain section='User Management' items={userManagement} />
                <NavMain section='Gym Management' items={gymManagement} />
                <NavMain section='Operations' items={operationsNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
