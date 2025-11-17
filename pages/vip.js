// pages/vip.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function VIPPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const VIP_THRESHOLDS = {
    1: 50000,
    2: 1200000,
    3: 7000000,
    4: 30000000,
    5: 150000000
  };

  const VIP_BENEFITS = {
    0: ['Akses produk Monitor', 'Investasi tanpa batas'],
    1: ['Unlock Insight 1', 'Profit langsung 140%', 'Semua benefit VIP 0'],
    2: ['Unlock Insight 2', 'Profit langsung 210%', 'Semua benefit VIP 1'],
    3: ['Unlock Insight 3', 'Unlock ALL AutoPilot', 'Profit hingga 235%', 'Semua benefit VIP 2'],
    4: ['Unlock Insight 4', 'Profit langsung 280%', 'Semua benefit VIP 3'],
    5: ['Unlock Insight 5', 'SEMUA produk tersedia', 'VIP ULTIMATE', 'Maximum benefits']
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const app = JSON.parse(localStorage.getItem('application') || '{}');

    setUserData({
      name: user.name || 'User',
      level: user.level || 0,
      total_invest_vip: user.total_invest_vip || 0,
      total_invest: user.total_invest || 0,
      balance: user.balance || 0
    });

    setApplicationData({
      name: app.name || 'XinXun',
      company: app.company || 'XinXun, Ltd'
    });

    setLoading(false);
  }, [router]);

  const getVIPProgress = () => {
    const totalVIP = userData?.total_invest_vip || 0;
    const currentLevel = userData?.level || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 5) {
      return { current: currentLevel, next: null, progress: 100, remaining: 0, nextThreshold: 0 };
    }

    const nextThreshold = VIP_THRESHOLDS[nextLevel];
    const progress = (totalVIP / nextThreshold) * 100;
    const remaining = nextThreshold - totalVIP;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(progress, 100),
      remaining: Math.max(remaining, 0),
      nextThreshold
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVIPConfig = (level) => {
    const configs = {
      0: { color: '#9ca3af', name: 'Basic', icon: 'mdi:shield-account' },
      1: { color: '#d97706', name: 'Bronze', icon: 'mdi:star-circle' },
      2: { color: '#6b7280', name: 'Silver', icon: 'mdi:medal' },
      3: { color: '#f59e0b', name: 'Gold', icon: 'mdi:trophy-variant' },
      4: { color: '#3b82f6', name: 'Platinum', icon: 'mdi:diamond-stone' },
      5: { color: '#06b6d4', name: 'Ultimate', icon: 'mdi:crown-circle' }
    };
    return configs[level] || configs[0];
  };

  const primaryColor = '#fe7d17';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin" />
      </div>
    );
  }

  const vipProgress = getVIPProgress();
  const currentLevel = userData?.level || 0;
  const currentConfig = getVIPConfig(currentLevel);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | VIP Status</title>
        <meta name="description" content="VIP Membership Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Status VIP</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Current Level Card */}
        <div className="mb-4 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${currentConfig.color}20` }}>
              <Icon icon={currentConfig.icon} className="w-10 h-10" style={{ color: currentConfig.color }} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">VIP</span>
              <div className="px-4 py-1 rounded-lg" style={{ backgroundColor: `${currentConfig.color}20` }}>
                <span className="text-2xl font-black" style={{ color: currentConfig.color }}>{currentLevel}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">{currentConfig.name}</p>
          </div>

          {vipProgress.next ? (
            <>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress ke VIP {vipProgress.next}</span>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {vipProgress.progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${vipProgress.progress}%`,
                      backgroundColor: primaryColor
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Investasi VIP</p>
                  <p className="font-bold text-gray-900 text-sm">{formatCurrency(userData?.total_invest_vip || 0)}</p>
                </div>
                <div className="p-3 rounded-xl border-2" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}40` }}>
                  <p className="text-xs text-gray-500 mb-1">Butuh Lagi</p>
                  <p className="font-bold text-sm" style={{ color: primaryColor }}>{formatCurrency(vipProgress.remaining)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6 rounded-xl bg-green-50 border border-green-200">
              <Icon icon="mdi:trophy" className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-green-700 mb-1">Level Maksimal!</p>
              <p className="text-sm text-green-600">Anda sudah mencapai VIP tertinggi</p>
            </div>
          )}
        </div>

        {/* VIP Levels List */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Semua Level VIP</h2>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((level) => {
              const isUnlocked = currentLevel >= level;
              const isCurrent = currentLevel === level;
              const threshold = VIP_THRESHOLDS[level] || 0;
              const config = getVIPConfig(level);

              return (
                <div
                  key={level}
                  className={`bg-white rounded-xl p-4 border-2 transition-all ${
                    isCurrent
                      ? 'border-[#fe7d17] shadow-sm'
                      : 'border-gray-200'
                  } ${!isUnlocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.color}20` }}>
                      <Icon icon={config.icon} className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">VIP {level}</h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full border border-green-200">
                            Saat Ini
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{config.name}</p>
                      {threshold > 0 && (
                        <p className="text-xs font-medium text-gray-600 mt-1">
                          Target: {formatCurrency(threshold)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Benefits:</p>
                    <ul className="space-y-1">
                      {VIP_BENEFITS[level].map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <Icon
                            icon={isUnlocked ? 'mdi:check-circle' : 'mdi:circle-outline'}
                            className={`w-4 h-4 flex-shrink-0 ${
                              isUnlocked ? 'text-green-500' : 'text-gray-300'
                            }`}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Upgrade */}
        <div className="mb-4 bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="mdi:information" className="w-5 h-5" style={{ color: primaryColor }} />
            Cara Naik Level VIP
          </h3>

          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">Investasi di Produk Monitor</p>
                <p className="text-xs text-green-600">Produk dengan profit terkunci yang menambah level VIP</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
              <Icon icon="mdi:close-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Insight & AutoPilot</p>
                <p className="text-xs text-red-600">Produk ini TIDAK menambah level VIP (profit langsung)</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4">
            <div className="flex items-start gap-2">
              <Icon icon="mdi:lightbulb" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">Tips:</span> Investasi Monitor memberikan return total saat selesai DAN menaikkan level VIP. Semakin tinggi level, semakin banyak produk eksklusif!
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon icon="mdi:monitor-dashboard" className="w-5 h-5" />
            Lihat Produk Monitor
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:chart-line" className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-xs text-gray-600">Total Investasi</span>
            </div>
            <p className="font-bold text-gray-900">{formatCurrency(userData?.total_invest || 0)}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="mdi:crown" className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-gray-600">Investasi VIP</span>
            </div>
            <p className="font-bold" style={{ color: primaryColor }}>{formatCurrency(userData?.total_invest_vip || 0)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavbar />
    </div>
  );
}
