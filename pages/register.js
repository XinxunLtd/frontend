import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { registerUser, getInfo } from '../utils/api';
import Image from 'next/image';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    password: '',
    password_confirmation: '',
    referral_code: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [closedRegister, setClosedRegister] = useState(false);
  const [referralLocked, setReferralLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formValidation, setFormValidation] = useState({
    name: false,
    number: false,
    password: false,
    passwordMatch: false,
    referralCode: false
  });

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      const accessExpire = sessionStorage.getItem('access_expire');
      if (token && accessExpire) {
        const now = new Date();
        const expiry = new Date(accessExpire);
        if (now < expiry) {
          router.replace('/dashboard');
          return;
        }
      }
    }
    
    if (router.query && router.query.reff) {
      setFormData((prev) => ({ ...prev, referral_code: router.query.reff }));
      setReferralLocked(true);
    }

    const storedApplication = sessionStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'XinXun',
          company: parsed.company || 'XinXun, Ltd',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'XinXun', company: 'XinXun, Ltd', healthy: false });
      }
    } else {
      setApplicationData({ name: 'XinXun', company: 'XinXun, Ltd', healthy: false });
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
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
          if (app.closed_register) {
            setClosedRegister(true);
            setNotification({ message: 'Pendaftaran sedang ditutup, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [router]);

  useEffect(() => {
    setFormValidation({
      name: formData.name.trim().length >= 3,
      number: /^8[0-9]{8,11}$/.test(formData.number),
      password: formData.password.length >= 6,
      passwordMatch: formData.password === formData.password_confirmation && formData.password.length > 0,
      referralCode: formData.referral_code.trim().length > 0
    });
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setFormData((prev) => ({ ...prev, [id]: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');
    if (value.startsWith('+')) value = value.slice(1);
    if (value.startsWith('62') && value[2] === '8') {
      value = value.slice(2);
    }
    if (value.startsWith('0') && value[1] === '8') {
      value = value.slice(1);
    }
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setFormData((prev) => ({ ...prev, number: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (maintenanceMode) {
      setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    if (closedRegister) {
      setNotification({ message: 'Pendaftaran sedang ditutup. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setNotification({ message: '', type: '' });
    
    try {
      const result = await registerUser(formData);
      
      if (result && result.success === true) {
        setFormData({ 
          name: '', 
          number: '', 
          password: '', 
          password_confirmation: '', 
          referral_code: referralLocked ? formData.referral_code : ''
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-token-changed'));
        }
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
      } else if (result && result.success === false) {
        const errorMessage = result.message || 'Terjadi kesalahan. Silakan coba lagi.';
        setNotification({ message: errorMessage, type: 'error' });
      } else {
        setNotification({ message: 'Respon server tidak valid. Silakan coba lagi.', type: 'error' });
      }
      
    } catch (error) {
      console.error('Register error:', error);
      
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-[#f45d16]';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Sangat Lemah';
    if (passwordStrength <= 2) return 'Lemah';
    if (passwordStrength <= 3) return 'Sedang';
    if (passwordStrength <= 4) return 'Kuat';
    return 'Sangat Kuat';
  };

  const isFormValid = Object.values(formValidation).every(Boolean) && termsAgreed;
  const primaryColor = '#fe7d17';

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Register</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Description`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex items-center justify-center mb-4">
              <div>
                <div className="w-full h-full flex items-center justify-center rounded-full bg-white">
                  <Image
                    src="/cover_logo.png"
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
              Daftar akun baru dan mulai berinvestasi.
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
                    
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Nama lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#fe7d17] focus:border-[#fe7d17]"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label
                  htmlFor="number"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Nomor HP
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
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
                <p className="mt-1 text-xs text-neutral-400">
                  Nomor WhatsApp aktif, tanpa 0 atau 62 di depan.
                </p>
              </div>

              {/* Password Field */}
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
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
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
                {formData.password && (
                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                    <span>Kekuatan password: {getPasswordStrengthText()}</span>
                    <span>
                      {formData.password.length >= 6 ? '✔ Minimal 6 karakter' : '✘ Minimal 6 karakter'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="password_confirmation"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Konfirmasi password
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                    placeholder="Ulangi password Anda"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-neutral-400 hover:text-neutral-700"
                  >
                    <Icon
                      icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                      className="h-5 w-5"
                    />
                  </button>
                </div>
                {formData.password_confirmation &&
                  formData.password.length >= 6 &&
                  formData.password_confirmation !== formData.password && (
                    <p className="mt-2 text-xs text-red-500">
                      Password dan konfirmasi password tidak sama.
                    </p>
                  )}
              </div>

              {/* Referral Code Field */}
              <div>
                <label
                  htmlFor="referral_code"
                  className="mb-1.5 block text-sm font-medium text-neutral-800"
                >
                  Kode referral
                </label>
                <input
                  type="text"
                  id="referral_code"
                  className={`h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#fe7d17] ${
                    referralLocked ? 'cursor-not-allowed bg-neutral-50' : ''
                  }`}
                  placeholder="Masukkan kode referral"
                  value={formData.referral_code}
                  onChange={handleChange}
                  disabled={referralLocked}
                  required
                />
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <label className="flex items-start gap-3 text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#fe7d17] focus:ring-[#fe7d17]"
                  />
                  <span>
                    Saya telah membaca dan menyetujui{' '}
                    <Link href="/privacy-policy" className="font-medium text-[#fe7d17]">
                      Kebijakan Privasi
                    </Link>{' '}
                    serta{' '}
                    <Link href="/terms-and-conditions" className="font-medium text-[#fe7d17]">
                      Syarat & Ketentuan
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor:
                    !maintenanceMode && !closedRegister && isFormValid
                      ? primaryColor
                      : '#f1f1f1',
                  color:
                    !maintenanceMode && !closedRegister && isFormValid
                      ? '#ffffff'
                      : '#b0b0b0',
                }}
                disabled={isLoading || !isFormValid || maintenanceMode || closedRegister}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sedang mendaftar...</span>
                  </>
                ) : (
                  <span>Daftar</span>
                )}
              </button>

              {/* Validation helper (ringkas) */}
              {!isFormValid && (
                <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs text-orange-700">
                  Lengkapi data dengan benar sebelum mendaftar.
                </div>
              )}
            </form>
          </div>

          <div className="mt-5 text-center text-sm">
            <p className="text-neutral-700">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-[#fe7d17]">
                Masuk di sini
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