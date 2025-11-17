// pages/ganti-sandi.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { changePassword } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';

export default function GantiSandi() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Validation
    if (!formData.current_password) {
      setErrorMsg("Kata sandi saat ini wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.new_password) {
      setErrorMsg("Kata sandi baru wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.confirm_password) {
      setErrorMsg("Konfirmasi kata sandi wajib diisi.");
      setLoading(false);
      return;
    }
    if (formData.new_password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      setLoading(false);
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setErrorMsg("Kata sandi baru dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    // Call API
    try {
      const res = await changePassword({
        current_password: formData.current_password,
        password: formData.new_password,
        confirmation_password: formData.confirm_password
      });
      setSuccessMsg(res.message || "Kata sandi berhasil diperbarui!");
      setErrorMsg('');
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      setSuccessMsg('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
    }
    const storedApplication = localStorage.getItem('application');
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
  }, [router]);

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Ganti Kata Sandi</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Change Password`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <Icon icon="mdi:lock-reset" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Ganti Kata Sandi</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Intro Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4 text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon icon="mdi:shield-lock" className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Keamanan Akun</h2>
          <p className="text-sm text-gray-600">
            Ubah kata sandi Anda secara berkala untuk melindungi akun
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          {/* Success & Error Message */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm leading-relaxed">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm leading-relaxed">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon icon="mdi:lock-outline" style={{ color: primaryColor }} />
                Kata Sandi Saat Ini
              </label>
              <div className="relative flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden focus-within:border-[#fe7d17] transition-all">
                <input
                  type={showPassword.current_password ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="•••••••"
                  className="flex-1 bg-transparent outline-none py-3 px-4 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current_password')}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Icon
                    icon={showPassword.current_password ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon icon="mdi:key-outline" style={{ color: primaryColor }} />
                Kata Sandi Baru
              </label>
              <div className="relative flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden focus-within:border-[#fe7d17] transition-all">
                <input
                  type={showPassword.new_password ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none py-3 px-4 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new_password')}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Icon
                    icon={showPassword.new_password ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Icon icon="mdi:key-check-outline" style={{ color: primaryColor }} />
                Konfirmasi Kata Sandi
              </label>
              <div className="relative flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden focus-within:border-[#fe7d17] transition-all">
                <input
                  type={showPassword.confirm_password ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none py-3 px-4 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Icon
                    icon={showPassword.confirm_password ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memperbarui...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle" className="w-5 h-5" />
                  Perbarui Sandi
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-blue-900 font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon icon="mdi:information-variant" className="text-blue-600" />
              Tips Keamanan Sandi
            </h3>
            <ul className="space-y-2 text-blue-800 text-xs">
              <li className="flex items-start gap-2">
                <Icon icon="mdi:check-circle" className="text-green-600 mt-0.5 flex-shrink-0 w-4 h-4" />
                <span className="leading-relaxed">Minimal 6 karakter dengan kombinasi huruf besar, kecil, dan angka</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="mdi:check-circle" className="text-green-600 mt-0.5 flex-shrink-0 w-4 h-4" />
                <span className="leading-relaxed">Perbarui sandi setiap 3 bulan untuk keamanan maksimal</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="mdi:check-circle" className="text-green-600 mt-0.5 flex-shrink-0 w-4 h-4" />
                <span className="leading-relaxed">Jangan gunakan sandi yang sama untuk banyak akun</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="mdi:check-circle" className="text-green-600 mt-0.5 flex-shrink-0 w-4 h-4" />
                <span className="leading-relaxed">Hubungi dukungan jika lupa sandi saat ini</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400 py-6">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
