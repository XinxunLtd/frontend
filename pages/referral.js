import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTeamInvited, getBonusTasks, submitBonusTask } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function Komisi() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [copied, setCopied] = useState({ code: false, link: false });
  const [reffCode, setReffCode] = useState('');
  const [teamStats, setTeamStats] = useState({
    1: { active: 0, count: 0 },
    2: { active: 0, count: 0 },
    3: { active: 0, count: 0 },
  });

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [claiming, setClaiming] = useState({});
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('code');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.reff_code) {
            setReffCode(user.reff_code);
          }
        }
      } catch (e) {}
    }

    getTeamInvited()
      .then((res) => {
        if (res && res.data) setTeamStats(res.data);
      })
      .catch(() => {});

    setLoadingTasks(true);
    getBonusTasks()
      .then(res => {
        setTasks(res.data || []);
      })
      .catch(e => {
        setMessage(e.message || 'Gagal memuat tugas');
      })
      .finally(() => {
        setLoadingTasks(false);
      });

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
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  };

  const handleClaim = async (taskId) => {
    setClaiming(prev => ({ ...prev, [taskId]: true }));
    setMessage('');
    try {
      await submitBonusTask(taskId);
      setMessage('Selamat! Hadiah berhasil diklaim.');
      setLoadingTasks(true);
      const res = await getBonusTasks();
      setTasks(res.data || []);
    } catch (e) {
      setMessage(e.message || 'Gagal mengambil hadiah');
    } finally {
      setClaiming(prev => ({ ...prev, [taskId]: false }));
      setLoadingTasks(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const referralLink = reffCode ? `${window.location.origin}/register?reff=${reffCode}` : '';
  const totalReferrals = (teamStats[1]?.count || 0);
  const totalActive = (teamStats[1]?.active || 0);
  const totalInvest = (teamStats[1]?.total_invest || 0);
  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Referral</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Referral`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto p-4">
        {/* Hero Stats - Big Numbers Center */}
        <div className="mb-6 text-center">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Total Referral Anda</p>
          <h2 className="text-6xl font-black mb-4" style={{ color: primaryColor }}>{totalReferrals}</h2>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
              <p className="text-xs text-gray-500">Aktif</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(totalInvest)}</p>
              <p className="text-xs text-gray-500">Total Investasi</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200">
            <Icon icon="mdi:star" className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-sm font-semibold text-gray-700">Komisi hingga 30%</span>
          </div>
        </div>

        {/* Referral Share - Tabbed Interface */}
        <div className="mb-6 bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'code'
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-50'
              }`}
              style={activeTab === 'code' ? { backgroundColor: primaryColor } : {}}
            >
              Kode Referral
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'link'
                  ? 'text-white'
                  : 'text-gray-500 bg-gray-50'
              }`}
              style={activeTab === 'link' ? { backgroundColor: primaryColor } : {}}
            >
              Link Referral
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'code' ? (
              <div className="text-center">
                <div className="mb-4 p-6 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300">
                  <p className="text-3xl font-black text-gray-900 tracking-widest font-mono">
                    {reffCode || '---'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(reffCode, 'code')}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: copied.code ? '#10b981' : primaryColor }}
                >
                  <Icon icon={copied.code ? "mdi:check-circle" : "mdi:content-copy"} className="w-5 h-5" />
                  {copied.code ? 'Kode Tersalin!' : 'Salin Kode'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs text-gray-600 break-all">
                    {referralLink || 'Link akan muncul setelah login'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: copied.link ? '#10b981' : primaryColor }}
                >
                  <Icon icon={copied.link ? "mdi:check-circle" : "mdi:content-copy"} className="w-5 h-5" />
                  {copied.link ? 'Link Tersalin!' : 'Salin Link'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Commission Visual */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Level Komisi</h3>
            <button
              onClick={() => router.push(`/referral/my-team?level=1`)}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: primaryColor }}
            >
              Lihat Tim
              <Icon icon="mdi:arrow-right" className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl" style={{ backgroundColor: primaryColor }}>
                  1
                </div>
                <div>
                  <p className="font-bold text-gray-900">Direct Referral</p>
                  <p className="text-xs text-gray-500">{totalReferrals} anggota</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black" style={{ color: primaryColor }}>30%</p>
                <p className="text-xs text-gray-500">Komisi</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700 font-medium">
                {totalActive} referral aktif dari {totalReferrals} total
              </p>
            </div>
          </div>
        </div>

        {/* Why Join - Horizontal Scroll */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Kenapa Bergabung?</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex-shrink-0 w-64 bg-white rounded-2xl p-5 border border-gray-200">
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <Icon icon="mdi:cash-fast" className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Komisi Instan</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dapatkan 30% komisi langsung saat referral Anda melakukan investasi
              </p>
            </div>

            <div className="flex-shrink-0 w-64 bg-white rounded-2xl p-5 border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-green-100 mb-3 flex items-center justify-center">
                <Icon icon="mdi:infinity" className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Unlimited Earning</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tidak ada batas maksimal penghasilan dari program referral
              </p>
            </div>

            <div className="flex-shrink-0 w-64 bg-white rounded-2xl p-5 border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-blue-100 mb-3 flex items-center justify-center">
                <Icon icon="mdi:rocket-launch" className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Easy Start</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cukup bagikan kode atau link, tanpa perlu investasi tambahan
              </p>
            </div>
          </div>
        </div>

        {/* Bonus Tasks - Compact Cards */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Bonus & Rewards</h3>

          {loadingTasks ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Memuat bonus...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-200">
              <Icon icon="mdi:gift-outline" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada bonus tersedia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const percent = task.percent || 0;
                const isLocked = task.lock;
                const isTaken = task.taken;
                const canClaim = !isLocked && !isTaken;

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">{task.name}</h4>
                          {canClaim && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              READY
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:account-group" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {task.active_subordinate_count}/{task.required_active_members}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:trophy" className="w-4 h-4" style={{ color: primaryColor }} />
                            <span className="text-sm font-bold" style={{ color: primaryColor }}>
                              {formatCurrency(task.reward)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: canClaim ? primaryColor : '#d1d5db'
                              }}
                            />
                          </div>
                        </div>

                        <button
                          className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                            canClaim
                              ? 'text-white'
                              : isTaken
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          style={canClaim ? { backgroundColor: primaryColor } : {}}
                          disabled={!canClaim || claiming[task.id]}
                          onClick={() => handleClaim(task.id)}
                        >
                          {claiming[task.id] ? (
                            'Memproses...'
                          ) : isTaken ? (
                            '✓ Terklaim'
                          ) : isLocked ? (
                            '🔒 Terkunci'
                          ) : (
                            'Klaim Sekarang'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {message && (
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700 font-medium">{message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavbar />

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
