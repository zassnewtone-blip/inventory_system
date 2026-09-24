import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    Edit,
    KeyRound,
    Lock,
    Mail,
    Plus,
    RotateCcw,
    Search,
    Shield,
    ShieldAlert,
    UserCheck,
    UserPlus,
    Users as UsersIcon,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type PaginatedData, type User } from '../../types';

interface Props {
    users: PaginatedData<User>;
    filters: {
        search?: string;
    };
}

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff' as 'admin' | 'staff',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingUser(null);
        setData({
            name: '',
            email: '',
            password: '',
            role: 'staff',
            is_active: true,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingUser(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/users', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search: search || undefined }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/users', {}, { preserveState: true });
    };

    return (
        <AppLayout title="User Management">
            <Head title="User Management (Admin)" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-800">User & Access Management</h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800">
                                <ShieldAlert size={12} /> Admin Only
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Create, configure, and manage system user credentials and authorization roles
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                        <UserPlus size={16} />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <form onSubmit={handleSearch} className="flex max-w-md items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by user name or email..."
                                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900"
                        >
                            Search
                        </button>
                        {search && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            >
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="py-3 px-4">User Name</th>
                                    <th className="py-3 px-4">Email Address</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="transition hover:bg-slate-50/60">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Mail size={13} className="text-slate-400" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">
                                                    <Shield size={12} /> Administrator
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                                                    <UsersIcon size={12} /> Staff Member
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                                    <UserCheck size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">
                                                    <UserX size={12} /> Deactivated
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition"
                                            >
                                                <Edit size={14} />
                                                <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <UsersIcon size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No users found</p>
                            <p className="text-xs text-slate-400">Try adjusting your search criteria.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                            <span>
                                Showing {users.from || 0} to {users.to || 0} of {users.total} users
                            </span>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded-lg px-2.5 py-1 font-medium transition ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'text-slate-600 hover:bg-slate-100'
                                                : 'cursor-not-allowed text-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-800">
                                {editingUser ? 'Edit User Credentials' : 'Create New System User'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Full Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Alex Johnson"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Email Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="alex@inventory.com"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    {editingUser ? 'Change Password (Optional)' : 'Password (Required)'}{' '}
                                    {!editingUser && <span className="text-rose-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={
                                        editingUser
                                            ? 'Leave blank to retain current password'
                                            : 'At least 6 characters'
                                    }
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Access Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value as 'admin' | 'staff')}
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="staff">Staff (Standard)</option>
                                        <option value="admin">Administrator (Full)</option>
                                    </select>
                                    {errors.role && <p className="mt-1 text-xs text-rose-600">{errors.role}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Account Status
                                    </label>
                                    <div className="mt-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="text-xs font-medium text-slate-700">
                                            Active Account
                                        </label>
                                    </div>
                                    {errors.is_active && (
                                        <p className="mt-1 text-xs text-rose-600">{errors.is_active}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

