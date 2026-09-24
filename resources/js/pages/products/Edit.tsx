import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { type Category, type Product, type Supplier } from '../../types';

interface Props {
    product: Product;
    categories: Category[];
    suppliers: Supplier[];
}

export default function ProductEdit({ product, categories, suppliers }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: product.name,
        sku: product.sku,
        category_id: product.category_id ? String(product.category_id) : '',
        supplier_id: product.supplier_id ? String(product.supplier_id) : '',
        description: product.description || '',
        unit_price: String(product.unit_price),
        minimum_stock: String(product.minimum_stock),
        unit: product.unit,
        image: null as File | null,
        status: product.status,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout title={`Edit: ${product.name}`}>
            <Head title={`Edit - ${product.name}`} />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                        >
                            <ArrowLeft size={14} /> Back to Products Catalog
                        </Link>
                        <h1 className="mt-1 text-xl font-bold text-slate-800">Edit Product</h1>
                        <p className="text-xs text-slate-500">Updating specifications for {product.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* General Info */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">General Information</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Product Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        SKU / Product Code <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-mono uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    {errors.sku && <p className="mt-1 text-xs text-rose-600">{errors.sku}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Category
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1 text-xs text-rose-600">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        Supplier
                                    </label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <p className="mt-1 text-xs text-rose-600">{errors.supplier_id}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Stock & Pricing */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Pricing & Inventory</h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Unit Price (₱) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.unit_price && <p className="mt-1 text-xs text-rose-600">{errors.unit_price}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Min. Stock Level <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={data.minimum_stock}
                                    onChange={(e) => setData('minimum_stock', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                {errors.minimum_stock && <p className="mt-1 text-xs text-rose-600">{errors.minimum_stock}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Unit of Measure <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="pcs">pcs</option>
                                    <option value="box">box</option>
                                    <option value="pack">pack</option>
                                    <option value="ream">ream</option>
                                    <option value="set">set</option>
                                    <option value="roll">roll</option>
                                    <option value="unit">unit</option>
                                </select>
                                {errors.unit && <p className="mt-1 text-xs text-rose-600">{errors.unit}</p>}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Status
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="w-full max-w-xs rounded-xl border border-slate-200 py-2.5 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="active">Active (Available in catalog)</option>
                                <option value="inactive">Inactive (Archived)</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Product Image</h2>

                        <div className="flex items-center gap-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-slate-400" size={28} />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Upload new image to replace current one (max 2MB).
                                </p>
                                {errors.image && <p className="mt-1 text-xs text-rose-600">{errors.image}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3">
                        <Link
                            href="/products"
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            <Save size={16} />
                            <span>{processing ? 'Saving...' : 'Update Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

