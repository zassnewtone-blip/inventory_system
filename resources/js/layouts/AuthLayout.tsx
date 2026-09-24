import { Box } from 'lucide-react';
import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 font-sans text-slate-800">
            <Toaster position="top-right" />
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30">
                        <Box size={32} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">InvenTrack</h1>
                    <p className="mt-1 text-sm text-slate-400">Inventory Management System</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-white p-6 shadow-2xl shadow-slate-950/40 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

