import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankAccounts, withdrawUser } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';

const Withdraw = () => {
  const router = useRouter();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [minWithdraw, setMinWithdraw] = useState(50000);
  const [maxWithdraw, setMaxWithdraw] = useState(5000000);
  const [fee, setFee] = useState(10);
  const [applicationData, setApplicationData] = useState(null);
  const [isWithdrawalAvailable, setIsWithdrawalAvailable] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  // Check if withdrawal is available (Monday-Saturday, 09:00-17:00 WIB)
  const checkWithdrawalAvailability = () => {
    const now = new Date();

    // Get WIB time (UTC+7)
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const day = wibTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = wibTime.getHours();

    // Check if it's Sunday (day 0)
    if (day === 0) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada hari kerja');
      return false;
    }

    // Check if it's within working hours (09:00 - 17:00)
    if (hours < 9 || hours > 17) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada jam kerja');
      return false;
    }

    // Available
    setIsWithdrawalAvailable(true);
    setWithdrawalMessage('');
    return true;
  };

  useEffect(() => {
    // Check availability on mount and every minute
    checkWithdrawalAvailability();
    const interval = setInterval(checkWithdrawalAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setUserData({
              name: user.name || "Tester",
              number: user.number || "882646678601",
              balance: user.balance || 0,
            });
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
        }
    }

    const appConfigStr = typeof window !== 'undefined' ? localStorage.getItem('application') : null;
    if (appConfigStr) {
        try {
            const appConfig = JSON.parse(appConfigStr);
            if (appConfig.min_withdraw) setMinWithdraw(Number(appConfig.min_withdraw));
            if (appConfig.max_withdraw) setMaxWithdraw(Number(appConfig.max_withdraw));
            if (appConfig.withdraw_charge) setFee(Number(appConfig.withdraw_charge));
            setApplicationData({
                name: appConfig.name || 'XinXun',
                healthy: appConfig.healthy || false,
            });
        } catch (e) {
            console.error("Failed to parse application data from localStorage", e);
            setApplicationData({ name: 'XinXun', healthy: false });
        }
    }

    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    if (!pageLoading) {
      const fetchBank = async () => {
        setFetching(true);
        try {
          const res = await getBankAccounts();
          const accounts = res.data?.bank_account || [];
          setBankAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedBankId(accounts[0].id);
          }
        } catch (err) {
          setErrorMsg('Gagal mengambil data rekening bank');
        } finally {
          setFetching(false);
        }
      };
      fetchBank();
    }
  }, [pageLoading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedBankId) {
      setErrorMsg('Silakan pilih rekening bank terlebih dahulu');
      return;
    }
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum < minWithdraw || amountNum > maxWithdraw) {
      setErrorMsg(`Jumlah penarikan minimal IDR ${formatCurrency(minWithdraw)} dan maksimal IDR ${formatCurrency(maxWithdraw)}`);
      return;
    }
    if (amountNum > userData?.balance) {
      setErrorMsg('Saldo tidak mencukupi untuk penarikan ini');
      return;
    }
    setLoading(true);
    try {
      const data = await withdrawUser({ amount: amountNum, bank_account_id: selectedBankId });
      if (data.success) {
        setSuccessMsg(data.message);
        setWithdrawAmount('');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses penarikan');
    }
    setLoading(false);
  };

  const primaryColor = '#fe7d17';

  if (pageLoading) {
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
        <title>{applicationData?.name || 'XinXun'} | Penarikan Dana</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Withdraw Funds`} />
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
              <Icon icon="mdi:cash-fast" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Penarikan Dana</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Balance Card */}
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
            <div className="flex items-center justify-between">
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
        </div>

        {/* Bank Account Selection */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:bank" className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Rekening Tujuan</h3>
            </div>
          </div>

          <div className="p-4">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-10 h-10 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-500">Memuat rekening...</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon icon="mdi:bank-off-outline" className="text-red-600 w-6 h-6" />
                </div>
                <h4 className="text-gray-900 font-bold mb-1 text-sm">Belum Ada Rekening</h4>
                <p className="text-gray-600 text-xs mb-3 px-4">Tambah rekening untuk withdraw</p>
                <button
                  onClick={() => router.push('/bank')}
                  className="px-4 py-2 rounded-lg text-white font-bold text-sm inline-flex items-center gap-2 hover:shadow-md transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                  Tambah Rekening
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {bankAccounts.map((bank) => (
                  <label
                    key={bank.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBankId === bank.id
                        ? 'bg-orange-50 border-orange-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      selectedBankId === bank.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {selectedBankId === bank.id && (
                        <Icon icon="mdi:check" className="text-white w-3 h-3" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="bank_account"
                      value={bank.id}
                      checked={selectedBankId === bank.id}
                      onChange={() => setSelectedBankId(bank.id)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:bank" className={`w-4 h-4 ${selectedBankId === bank.id ? 'text-orange-600' : 'text-blue-600'}`} />
                        <h4 className="font-bold text-sm text-gray-900">{bank.bank_name}</h4>
                      </div>
                      <p className="text-xs text-gray-700 font-semibold">{bank.account_number}</p>
                      <p className="text-xs text-gray-500">{bank.account_name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Form */}
        {bankAccounts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-4">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:cash-fast" className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">Form Penarikan</h3>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="p-4 space-y-4">
              {/* Withdrawal Not Available Warning */}
              {!isWithdrawalAvailable && withdrawalMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
                  <Icon icon="mdi:clock-alert-outline" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 text-sm font-semibold mb-1">{withdrawalMessage}</p>
                    <p className="text-yellow-700 text-xs">Penarikan dana tersedia Senin-Sabtu pukul 09:00 - 17:00 WIB</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">{successMsg}</p>
                </div>
              )}

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Icon icon="mdi:cash-multiple" className="w-4 h-4" style={{ color: primaryColor }} />
                  Jumlah Penarikan
                </label>
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[#fe7d17]">
                  <div className="flex items-center justify-center px-4 bg-gray-100 h-full border-r border-gray-200">
                    <span className="text-gray-700 text-sm font-semibold">IDR</span>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 bg-transparent outline-none py-3 px-4 text-gray-900 placeholder-gray-400 text-base font-medium"
                    placeholder={minWithdraw.toLocaleString('id-ID')}
                    min={minWithdraw}
                    max={maxWithdraw}
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500">Min: Rp {formatCurrency(minWithdraw)}</span>
                  <span className="text-gray-500">Maks: Rp {formatCurrency(maxWithdraw)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isWithdrawalAvailable}
                className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: isWithdrawalAvailable ? '#22c55e' : '#6b7280' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : !isWithdrawalAvailable ? (
                  <>
                    <Icon icon="mdi:lock-clock" className="w-5 h-5" />
                    <span>Penarikan Tidak Tersedia</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send-check" className="w-5 h-5" />
                    <span>Konfirmasi Penarikan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:information-variant" className="w-5 h-5 text-blue-600" />
            Informasi Penarikan
          </h4>
          <div className="space-y-2.5">
            {[
              { icon: "mdi:cash-multiple", text: `Penarikan dana min sebesar Rp ${formatCurrency(minWithdraw)}` },
              { icon: "mdi:cash-minus", text: `Penarikan memakan biaya ${fee}% yang dipotong langsung dari jumlah penarikan` },
              { icon: "mdi:wallet-outline", text: "Pengguna dapat menarik seluruh saldo tersedia tanpa syarat apapun" },
              { icon: "mdi:calendar-clock", text: "Pengguna hanya dapat melakukan penarikan 1x per hari" },
              { icon: "mdi:clock-outline", text: "Penarikan dana akan terbuka setiap hari Senin hingga Sabtu pada pukul 09:00 - 17:00 WIB" },
              { icon: "mdi:lightning-bolt", text: "Seluruh Penarikan akan diproses dengan sistem batch secara otomatis pada pukul 17:00 - 19:00 WIB" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <Icon icon={item.icon} className="text-blue-600 w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-xs leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
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
};

export default Withdraw;
