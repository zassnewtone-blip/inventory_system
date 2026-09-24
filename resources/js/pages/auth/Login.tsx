import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { useState } from 'react';
import AuthLayout from '../../layouts/AuthLayout';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@inventory.com',
        password: 'admin123',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const setQuickAccount = (email: string, pass: string) => {
        setData((prev) => ({
            ...prev,
            email,
            password: pass,
        }));
    };

    return (
        <AuthLayout>
            <Head title="Sign In" />

            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
                <p className="mt-1 text-xs text-slate-500">
                    Sign in to your account to access the inventory system
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="user@example.com"
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-slate-600">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Remember me</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                >
                    <LogIn size={16} />
                    <span>{processing ? 'Signing in...' : 'Sign In'}</span>
                </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="mb-2 text-center text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                    Quick Test Credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setQuickAccount('admin@inventory.com', 'admin123')}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs transition hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                        <p className="font-semibold text-indigo-700">Administrator</p>
                        <p className="text-[11px] text-slate-500">admin@inventory.com</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickAccount('staff@inventory.com', 'staff123')}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs transition hover:border-emerald-300 hover:bg-emerald-50/50"
                    >
                        <p className="font-semibold text-emerald-700">Staff User</p>
                        <p className="text-[11px] text-slate-500">staff@inventory.com</p>
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}

