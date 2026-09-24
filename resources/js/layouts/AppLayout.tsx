import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    PackageMinus,
    PackagePlus,
    Shield,
    Sliders,
    Tag,
    Truck,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { type SharedProps } from '../types';

interface Props {
    children: ReactNode;
    title?: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Categories', href: '/categories', icon: Tag },
    { label: 'Suppliers', href: '/suppliers', icon: Truck },
    { label: 'Stock In', href: '/inventory/stock-in', icon: PackagePlus },
    { label: 'Stock Out', href: '/inventory/stock-out', icon: PackageMinus },
    { label: 'Adjustment', href: '/inventory/adjustment', icon: Sliders, adminOnly: true },
    { label: 'Transactions', href: '/transactions', icon: ClipboardList },
    { label: 'Inventory Report', href: '/reports/inventory', icon: BarChart3 },
    { label: 'Stock Movement', href: '/reports/stock-movement', icon: BarChart3 },
    { label: 'Low Stock Report', href: '/reports/low-stock', icon: BarChart3 },
    { label: 'User Management', href: '/users', icon: Users, adminOnly: true },
];

export default function AppLayout({ children, title }: Props) {
    const page = usePage<SharedProps>() || {} as SharedProps;
    // Provide defaults so the component works even if the server hasn't sent `auth` yet
    const { auth = {}, flash = {}, url = '' } = page;
    const user = auth.user ?? { name: 'Guest', role: 'staff' };

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Watch for flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    const isCurrentUrl = (path: string) => {
        if (path === '/dashboard') {
            return url === '/dashboard' || url === '/';
        }
        return url.startsWith(path);
    };

    const filteredNav = navItems.filter((item) => !item.adminOnly || user?.role === 'admin');

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
            <Toaster position="top-right" />

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 lg:static ${
                    collapsed ? 'w-20' : 'w-64'
                } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Brand Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
                            <Box size={22} />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="text-base font-bold tracking-tight text-white">InvenTrack</h1>
                                <p className="text-[11px] font-medium text-slate-400">Inventory System</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:block"
                        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {filteredNav.map((item) => {
                        const active = isCurrentUrl(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon size={19} className="shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-slate-800 p-3">
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2 rounded-lg bg-slate-800/60 p-2.5`}>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                                <UserIcon size={18} />
                            </div>
                            {!collapsed && (
                                <div className="truncate">
                                    <p className="truncate text-xs font-semibold text-white">{user?.name || 'User'}</p>
                                    <div className="flex items-center gap-1">
                                        <Shield size={10} className="text-indigo-400" />
                                        <span className="text-[10px] font-medium tracking-wider uppercase text-indigo-400">
                                            {user?.role || 'staff'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Navigation Bar */}
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>
                        {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-[11px] capitalize text-slate-500">{user?.role} Account</p>
                        </div>
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                user?.role === 'admin'
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                            {user?.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-600"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Alert banners if any */}
                {flash?.success && (
                    <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {flash.error}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

