import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { loginUser, getInfo } from '../utils/api';
import Image from 'next/image';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ number: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        const storedApplication = sessionStorage.getItem('application');
        if (storedApplication) {
            try {
                const parsed = JSON.parse(storedApplication);
                setApplicationData({
                    name: parsed.name || 'XinXun',
                    healthy: parsed.healthy || false,
                });
            } catch (e) {
                setApplicationData({ name: 'XinXun', healthy: false });
            }
        } else {
            setApplicationData({ name: 'XinXun', healthy: false });
        }

        (async () => {
            try {
                const data = await getInfo();
                if (data && data.success && data.data) {
                    const app = data.data;
                    if (app.name && app.company) {
                        const stored = JSON.parse(sessionStorage.getItem('application') || '{}');
                        const merged = { ...(stored || {}), name: app.name, company: app.company };
                        sessionStorage.setItem('application', JSON.stringify(merged));
                        setApplicationData(prev => ({ ...(prev || {}), name: app.name, company: app.company }));
                    }
                    if (app.maintenance) {
                        setMaintenanceMode(true);
                        setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
                    }
                }
            } catch (err) {
                // ignore fetch errors here
            }
        })();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e) => {
        let value = e.target.value.replace(/[^0-9+]/g, '');

        if (value.startsWith('+')) {
            value = value.slice(1);
        }

        value = value.replace(/[^0-9]/g, '');

        if (/^(62|0)8/.test(value)) {
            value = value.replace(/^(62|0)/, '');
        }

        if (!value.startsWith('8') && value.length > 0) {
            value = value.replace(/^62/, '');
        }

        if (value.length > 12) value = value.slice(0, 12);

        setFormData((prev) => ({ ...prev, number: value }));
    };

    useEffect(() => {
        const num = formData.number || '';
        const isPhoneValid = /^8\d{8,11}$/.test(num);
        setIsFormValid(isPhoneValid && (formData.password || '').length >= 6);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (maintenanceMode) {
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat masuk. Silakan coba lagi nanti.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setNotification({ message: '', type: '' });

        try {
            const result = await loginUser(formData);

            if (result && result.success === true) {
                setFormData({ number: '', password: '' });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('user-token-changed'));
                }

                router.push('/dashboard');

            } else if (result && result.success === false) {
                const errorMessage = result.message || 'Terjadi kesalahan. Silakan coba lagi.';
                setNotification({ message: errorMessage, type: 'error' });
            } else {
                setNotification({ message: 'Respon server tidak valid. Silakan coba lagi.', type: 'error' });
            }

        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                const statusCode = error.response.status;
                const responseData = error.response.data;

                if (statusCode >= 400 && statusCode < 500) {
                    const errorMessage = responseData?.message || 'Data yang dimasukkan tidak valid';
                    setNotification({ message: errorMessage, type: 'error' });
                } else if (statusCode >= 500) {
                    const errorMessage = responseData?.message || 'Terjadi kesalahan server. Silakan coba lagi nanti.';
                    setNotification({ message: errorMessage, type: 'error' });
                } else {
                    setNotification({ message: 'Terjadi kesalahan yang tidak diketahui', type: 'error' });
                }
            } else if (error.request) {
                setNotification({ message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', type: 'error' });
            } else {
                const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
                setNotification({ message: errorMessage, type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (token && accessExpire) {
            const now = new Date();
            const expiry = new Date(accessExpire);
            if (now < expiry) {
                router.replace('/dashboard');
            }
        }
    }, [router]);

    const primaryColor = '#fe7d17';

    return (
        <>
            <Head>
                <title>{applicationData?.name || 'XinXun'} | Login</title>
                <meta name="description" content={`${applicationData?.name || 'XinXun'} Description`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative flex items-center justify-center mb-4">
                            <div>
                                <div className="w-full h-full flex items-center justify-center rounded-full bg-white">
                                    <Image
                                        src="/logo.svg"
                                        alt="XinXun Logo"
                                        width={150}
                                        height={150}
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-neutral-900">
                            {applicationData?.name || 'XinXun'}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500">
                            Masuk untuk melanjutkan ke dashboard Anda
                        </p>
                    </div>

                    <div className="border rounded-3xl bg-white shadow-sm px-6 py-7">
                        {notification.message && (
                            <div
                                className={`mb-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
                                    notification.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                }`}
                            >
                                <Icon
                                    icon={
                                        notification.type === 'success'
                                            ? 'mdi:check-circle'
                                            : 'mdi:alert-circle'
                                    }
                                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                                />
                                <span className="flex-1">{notification.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="number"
                                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                                >
                                    Nomor HP
                                </label>
                                <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]"
                                    style={{ focusWithin: { borderColor: primaryColor } }}
                                >
                                    <span className="mr-2 text-sm font-medium text-neutral-600">
                                        +62
                                    </span>
                                    <input
                                        type="tel"
                                        id="number"
                                        className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                                        placeholder="8xxxxxxxxxxx"
                                        value={formData.number}
                                        onChange={handleNumberChange}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                                >
                                    Password
                                </label>
                                <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                                        placeholder="Masukkan password Anda"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="ml-2 text-neutral-400 hover:text-neutral-700"
                                    >
                                        <Icon
                                            icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                                            className="h-5 w-5"
                                        />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                style={{
                                    backgroundColor:
                                        !maintenanceMode && isFormValid
                                            ? primaryColor
                                            : '#f1f1f1',
                                    color:
                                        !maintenanceMode && isFormValid
                                            ? '#ffffff'
                                            : '#b0b0b0',
                                }}
                                disabled={isLoading || !isFormValid || maintenanceMode}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Sedang login...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-center text-xs text-neutral-500">
                                Dengan masuk, Anda menyetujui {' '}
                                <Link
                                    href="/terms-and-conditions"
                                    className="font-medium text-[#fe7d17]"
                                >
                                    Syarat & Ketentuan 
                                </Link>{' '}
                                serta{' '}
                                <Link
                                    href="/privacy-policy"
                                    className="font-medium text-[#fe7d17]"
                                >
                                    Kebijakan Privasi
                                </Link>
                                .
                            </p>
                        </form>
                    </div>

                    <div className="mt-5 text-center text-sm">
                        <p className="text-neutral-700">
                            Belum punya akun? {' '}
                            <Link href="/register" className="font-semibold text-[#fe7d17]">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 text-center text-xs text-neutral-400">
                        © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
                    </div>
                </div>
            </div>
        </>
    );
}