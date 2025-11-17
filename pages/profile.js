import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import AppInstallButton from '../components/AppInstallButton';
import MobileAppStatus from '../components/MobileAppStatus';
import AndroidAppLinksTester from '../components/AndroidAppLinksTester';
import { logoutUser } from '../utils/api';
import { isMobileApp } from '../utils/mobileAppDetection';
import Image from 'next/image';

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState({ link_app: '', link_cs: '', link_group: '' });
  const [loading, setLoading] = useState(true);

  // App Install States
  const [isInMobileApp, setIsInMobileApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) {
      setUserData({
        name: "Tester",
        number: "882646678601",
        balance: 0,
	level: 0,
        total_deposit: 0,
        total_withdraw: 0,
        level: 0,
        active: false
      });
    } else {
      setUserData(user);
    }

    let appData = {
      name: 'XinXun',
      healthy: false,
      link_app: '',
      link_cs: '',
      link_group: ''
    };
    try {
      const rawApp = localStorage.getItem('application');
      if (rawApp) {
        const parsedApp = JSON.parse(rawApp);
        appData = {
          name: parsedApp.name || 'XinXun',
          healthy: parsedApp.healthy ?? false,
          link_app: parsedApp.link_app || parsedApp.link_app_url || '',
          link_cs: parsedApp.link_cs || parsedApp.link_cs_url || '',
          link_group: parsedApp.link_group || parsedApp.link_group_url || ''
        };
      } else {
        appData.link_app = localStorage.getItem('link_app') || '';
        appData.link_cs = localStorage.getItem('link_cs') || '';
        appData.link_group = localStorage.getItem('link_group') || '';
      }
    } catch (e) {
      appData.link_app = localStorage.getItem('link_app') || '';
      appData.link_cs = localStorage.getItem('link_cs') || '';
      appData.link_group = localStorage.getItem('link_group') || '';
    }
    setApplicationData(appData);
    setLoading(false);

    // Detect if running in mobile app (TWA/WebView)
    setIsInMobileApp(isMobileApp());
  }, []);


  const handleLogout = () => {
    try {
      logoutUser().catch(() => {});
    } catch (e) {}

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_expire');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    if (typeof document !== 'undefined') {
      document.cookie = 'refresh_token=; Max-Age=0; path=/;';
    }
    router.push('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const isVerified = userData?.active === true;

  const getVIPLabel = (level) => {
    const labels = {
      0: 'Basic',
      1: 'Bronze',
      2: 'Silver',
      3: 'Gold',
      4: 'Platinum',
      5: 'Diamond'
    };
    return labels[level] || 'Member';
  };

  const primaryColor = '#fe7d17';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Profile</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Profile`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header with Avatar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fe7d17] to-[#ff9a52] flex items-center justify-center">
                <Icon icon="mdi:account" className="w-10 h-10 text-white" />
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <Icon icon="mdi:check" className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">
                {userData?.name || 'Tester'}
              </h1>
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="mdi:phone" className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">+62{userData?.number || '882646678601'}</p>
              </div>
              <button
                onClick={() => router.push('/vip')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Icon icon="mdi:crown" className="w-3.5 h-3.5" />
                VIP {userData?.level || 0} - {getVIPLabel(userData?.level || 0)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Balance Cards */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Ringkasan Keuangan</h2>
          <div className="space-y-3">
            {/* Balance */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Icon icon="mdi:wallet" className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Saldo</p>
                  <p className="text-base font-bold text-gray-900">Rp {formatCurrency(userData?.balance || 0)}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/withdraw')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Tarik
              </button>
            </div>

            {/* Investment and Withdraw */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="mdi:trending-up" className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">Investasi</p>
                </div>
                <p className="text-sm font-bold text-green-900">Rp {formatCurrency(userData?.total_invest || 0)}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="mdi:trending-down" className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-red-700 font-medium">Penarikan</p>
                </div>
                <p className="text-sm font-bold text-red-900">Rp {formatCurrency(userData?.total_withdraw || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon icon="mdi:rocket-launch" className="w-5 h-5" />
            Investasi
          </button>
          <button
            onClick={() => router.push('/portofolio')}
            className="p-4 rounded-xl bg-white border-2 border-gray-200 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:chart-box" className="w-5 h-5" style={{ color: primaryColor }} />
            <span className="text-[#fe7d17]">Portofolio</span>
          </button>
        </div>

        {/* App Install/Status */}
        <AppInstallButton applicationData={applicationData} />
        <MobileAppStatus applicationData={applicationData} />

        {/* Menu Section - List Style */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Akun & Layanan</h3>
          </div>

          {/* Menu Items */}
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => router.push('/bank')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon icon="mdi:bank" className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Akun Bank</p>
                <p className="text-xs text-gray-500">Kelola rekening Anda</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/history/investment')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:history" className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Riwayat Investasi</p>
                <p className="text-xs text-gray-500">Lihat transaksi investasi</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/history/withdraw')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <Icon icon="mdi:cash-clock" className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Riwayat Penarikan</p>
                <p className="text-xs text-gray-500">Lihat transaksi penarikan</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/transactions')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Semua Transaksi</p>
                <p className="text-xs text-gray-500">Riwayat lengkap transaksi</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/password')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Icon icon="mdi:lock-reset" className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Ganti Kata Sandi</p>
                <p className="text-xs text-gray-500">Ubah password akun</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Support & Community */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Bantuan & Komunitas</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {applicationData.link_cs ? (
              <a
                href={applicationData.link_cs}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <Icon icon="mdi:headset" className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Customer Service</p>
                  <p className="text-xs text-gray-500">Hubungi tim support</p>
                </div>
                <Icon icon="mdi:open-in-new" className="w-5 h-5 text-gray-400" />
              </a>
            ) : (
              <div className="w-full flex items-center gap-3 px-4 py-3 opacity-50">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Icon icon="mdi:headset" className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-500">Customer Service</p>
                  <p className="text-xs text-gray-400">Tidak tersedia</p>
                </div>
              </div>
            )}

            {applicationData.link_group ? (
              <a
                href={applicationData.link_group}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon icon="mdi:telegram" className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Grup Telegram</p>
                  <p className="text-xs text-gray-500">Bergabung dengan komunitas</p>
                </div>
                <Icon icon="mdi:open-in-new" className="w-5 h-5 text-gray-400" />
              </a>
            ) : (
              <div className="w-full flex items-center gap-3 px-4 py-3 opacity-50">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Icon icon="mdi:telegram" className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-500">Grup Telegram</p>
                  <p className="text-xs text-gray-400">Tidak tersedia</p>
                </div>
              </div>
            )}

            {userData?.level !== 0 && (
              <a
                href="https://t.me/+fwFbZTLbjdcyM2Y1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Icon icon="mdi:forum" className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">Forum Diskusi</p>
                  <p className="text-xs text-gray-500">Khusus member VIP</p>
                </div>
                <Icon icon="mdi:open-in-new" className="w-5 h-5 text-gray-400" />
              </a>
            )}
          </div>
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Informasi</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <button
              onClick={() => router.push('/about-us')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon icon="mdi:information-outline" className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Tentang Kami</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/privacy-policy')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon icon="mdi:shield-check-outline" className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Kebijakan Privasi</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => router.push('/terms-and-conditions')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Syarat & Ketentuan</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <Icon icon="mdi:logout" className="w-5 h-5" />
          Keluar dari Akun
        </button>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />

      {/* Android App Links Tester - Development Only */}
      <AndroidAppLinksTester />
    </div>
  );
}
