import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, RotateCcw, Search, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type Category, type PaginatedData } from '../../types';

interface Props {
    categories: PaginatedData<Category>;
    filters: {
        search?: string;
    };
}

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingCategory(null);
        setData({
            name: '',
            description: '',
            is_active: true,
        });
        clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            is_active: category.is_active,
        });
        clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/categories/${editingCategory.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/categories', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/categories', { search: search || undefined }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/categories', {}, { preserveState: true });
    };

    const confirmDelete = (cat: Category) => {
        if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
            router.delete(`/categories/${cat.id}`);
        }
    };

    return (
        <AppLayout title="Category Management">
            <Head title="Categories" />

            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Product Categories</h1>
                    <p className="text-xs text-slate-500">Organize products into distinct operational groups</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                    <Plus size={16} />
                    <span>Add Category</span>
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
                            placeholder="Search categories..."
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
                                <th className="py-3 px-4 font-semibold">Category Name</th>
                                <th className="py-3 px-4 font-semibold">Description</th>
                                <th className="py-3 px-4 font-semibold">Products Count</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {categories.data.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50/60">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5 font-semibold text-slate-900">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                <Tag size={15} />
                                            </div>
                                            <span>{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-500">
                                        {category.description || <span className="italic text-slate-400">None</span>}
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-800">
                                        {category.products_count ?? 0} items
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                category.is_active
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(category)}
                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(category)}
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

                    {categories.data.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                            <Tag size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-semibold text-slate-600">No categories found</p>
                            <p className="text-xs text-slate-400">Create your first product category using the button above.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>Showing {categories.from || 0} to {categories.to || 0} of {categories.total} entries</span>
                        <div className="flex gap-1">
                            {categories.links.map((link, idx) => (
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
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-800">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                                    Category Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Computer Peripherals"
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Optional description..."
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
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
                                    {processing ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

