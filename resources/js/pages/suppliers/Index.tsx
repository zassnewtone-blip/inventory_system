import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Mail, Phone, Plus, RotateCcw, Search, Trash2, Truck, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type PaginatedData, type Supplier } from '../../types';

interface Props {
    suppliers: PaginatedData<Supplier>;
    filters: {
        search?: string;
    };
}

export default function SuppliersIndex({ suppliers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingSupplier(null);
        setData({
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            is_active: true,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            is_active: supplier.is_active,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingSupplier(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            put(`/suppliers/${editingSupplier.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/suppliers', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/suppliers', { search: search || undefined }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/suppliers', {}, { preserveState: true });
    };

    const confirmDelete = (sup: Supplier) => {
        if (confirm(`Are you sure you want to delete supplier "${sup.name}"?`)) {
            router.delete(`/suppliers/${sup.id}`);
        }
    };

    return (
        <AppLayout title="Supplier Management">
            <Head title="Suppliers" />

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Suppliers Directory</h1>
                    <p className="text-xs text-slate-500">Manage vendors, contact persons, and supply sources</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    <span>Add Supplier</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <form onSubmit={handleSearch} className="flex max-w-md items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, phone, contact..."
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
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                        >
                            <RotateCcw size={15} />
                        </button>
                    )}
                </form>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Supplier</th>
                                <th className="py-3 px-4 font-semibold">Contact Person</th>
                                <th className="py-3 px-4 font-semibold">Phone & Email</th>
                                <th className="py-3 px-4 font-semibold">Supplied Items</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {suppliers.data.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50/60">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                <Truck size={16} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{supplier.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate max-w-xs">{supplier.address || 'No address'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                        {supplier.contact_person || <span className="italic text-slate-400">N/A</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-0.5">
                                            {supplier.phone && (
                                                <p className="flex items-center gap-1 text-slate-600">
                                                    <Phone size={11} className="text-slate-400" />
                                                    <span>{supplier.phone}</span>
                                                </p>
                                            )}
                                            {supplier.email && (
                                                <p className="flex items-center gap-1 text-slate-600">
                                                    <Mail size={11} className="text-slate-400" />
                                                    <span>{supplier.email}</span>
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-800">
                                        {supplier.products_count ?? 0} items
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                supplier.is_active
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {supplier.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(supplier)}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(supplier)}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {suppliers.data.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <Truck size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No suppliers found</p>
                            <p className="text-xs text-slate-400">Add suppliers to track purchase origins.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {suppliers.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>Showing {suppliers.from || 0} to {suppliers.to || 0} of {suppliers.total} entries</span>
                        <div className="flex gap-1">
                            {suppliers.links.map((link, idx) => (
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

            {/* Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-800">
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Supplier / Company Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Global Tech Supplies Inc."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        placeholder="e.g., Jane Smith"
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    {errors.contact_person && <p className="mt-1 text-xs text-rose-600">{errors.contact_person}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="e.g., +63 912 345 6789"
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="orders@supplier.com"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Warehouse or office address..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Active Status</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
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
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {processing ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

