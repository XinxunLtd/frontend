// pages/portofolio.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getActiveInvestments } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function InvestasiSaya() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState({});
  const [tabKeys, setTabKeys] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState('');
  const [applicationData, setApplicationData] = useState(null);

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
      });
    } else {
      setUserData(user);
    }
    setLoading(false);
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

  useEffect(() => {
    setInvLoading(true);
    setInvError('');
    getActiveInvestments()
      .then(res => {
        const data = res.data || {};
        setInvestments(data);
        // Order tabs explicitly: Router (left), Mifi (middle), Powerbank (right)
        const origKeys = Object.keys(data);
        const preferred = ['Router', 'Mifi', 'Powerbank'];
        const keys = [
          ...preferred.filter(k => origKeys.includes(k)),
          ...origKeys.filter(k => !preferred.includes(k))
        ];
        setTabKeys(keys);
        if (keys.length > 0) setActiveTab(keys[0]);
      })
      .catch(e => setInvError(e.message || 'Gagal memuat investasi aktif'))
      .finally(() => setInvLoading(false));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const getStatusColor = (status) => {
    if (status === 'Running') return 'bg-green-500';
    if (status === 'Completed') return 'bg-blue-500';
    if (status === 'Suspended') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusProfit = (status) => {
    if (status === 'unlocked') return 'Terbuka';
    if (status === 'locked') return 'Terkunci';
    return 'Unknown';
  };

  const getStatusProfitColor = (status) => {
    if (status === 'unlocked') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'locked') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStarIcon = (tabName) => {
    if (tabName.toLowerCase().includes('router')) return 'mdi:router-network';
    if (tabName.toLowerCase().includes('mifi')) return 'mdi:wifi';
    if (tabName.toLowerCase().includes('powerbank')) return 'mdi:power-plug';
    if (tabName.includes('1')) return 'mdi:star-outline';
    if (tabName.includes('2')) return 'mdi:star-half-full';
    if (tabName.includes('3')) return 'mdi:star';
    return 'mdi:star-outline';
  };

  const primaryColor = '#fe7d17';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Portofolio Saya</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Portfolio`} />
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
              <Icon icon="mdi:chart-line" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Portofolio Saya</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#fe7d17] to-[#ff9a52] flex items-center justify-center">
              <Icon icon="mdi:account" className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900">{userData?.name || 'Tester'}</h2>
              <p className="text-xs text-gray-500">+62{userData?.number || '882646678601'}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:wallet" className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Saldo</p>
                <p className="text-lg font-bold text-gray-900">Rp {formatCurrency(userData?.balance || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon icon="mdi:trending-up" className="text-blue-600 w-4 h-4" />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Investasi</span>
            </div>
            <p className="text-gray-900 font-bold text-lg">
              {Object.values(investments).flat().length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon icon="mdi:cash-multiple" className="text-green-600 w-4 h-4" />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Return</span>
            </div>
            <p className="text-green-600 font-bold text-sm">
              Rp {formatCurrency(
                Object.values(investments).flat().reduce((sum, inv) => sum + inv.total_returned, 0)
              )}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategori Produk</h3>
          <div className="flex gap-2 justify-between">
            {tabKeys.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500 text-xs py-2 px-3 bg-white rounded-lg border border-gray-200 w-full justify-center">
                <Icon icon="mdi:information-outline" className="w-4 h-4" />
                <span>Tidak ada kategori</span>
              </div>
            ) : (
              tabKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === key
                      ? 'text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={activeTab === key ? { backgroundColor: primaryColor } : {}}
                >
                  <Icon icon={getStarIcon(key)} className="w-4 h-4" />
                  {key}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Investment List */}
        <div className="space-y-3">
          {invLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 text-sm">Mengambil data investasi...</p>
            </div>
          ) : invError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 text-sm">{invError}</span>
            </div>
          ) : !activeTab || !investments[activeTab] || investments[activeTab].length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon icon="mdi:database-off" className="text-gray-400 w-7 h-7" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Belum Ada Investasi</h3>
              <p className="text-gray-600 text-sm">Anda belum memiliki investasi di kategori {activeTab}.</p>
            </div>
          ) : (
            investments[activeTab].map((inv) => {
              const percent = inv.duration > 0 ? Math.round((inv.total_paid / inv.duration) * 100) : 0;
              return (
                <div key={inv.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="mdi:chart-box" className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{inv.product_name || 'Produk Investasi'}</p>
                          {inv.category_name && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusProfitColor(inv.product_category.profit_type)}`}>
                              {getStatusProfit(inv.product_category.profit_type)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">#{inv.order_id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Amounts */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Modal Investasi</span>
                        <span className="text-sm font-bold text-gray-900">Rp {formatCurrency(inv.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Profit Per Hari</span>
                        <span className="text-sm font-bold text-green-600">+ Rp {formatCurrency(inv.daily_profit)}</span>
                      </div>
                    </div>

                    {/* Total Profit */}
                    <div className="bg-green-50 rounded-lg p-3 mb-4 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon icon="mdi:cash-multiple" className="text-green-600 w-4 h-4" />
                          <span className="text-xs font-semibold text-green-900">Total Profit</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">Rp {formatCurrency(inv.total_returned)}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Progress Pembayaran</span>
                        <span className="text-xs font-bold text-gray-900">{percent}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: primaryColor }}
                        ></div>
                      </div>
                    </div>

                    {/* Dates */}
                    {inv.last_return_at && inv.next_return_at && (
                      <div className="pt-3 border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Icon icon="mdi:history" className="w-3.5 h-3.5" />
                            Return Terakhir
                          </span>
                          <span className="text-gray-700 font-semibold">{new Date(inv.last_return_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Icon icon="mdi:clock-fast-forward" className="w-3.5 h-3.5" />
                            Return Berikutnya
                          </span>
                          <span className="text-gray-700 font-semibold">{new Date(inv.next_return_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-xs py-6">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
