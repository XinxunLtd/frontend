import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankList, editBankAccount, getBankAccountById } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function BankEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [bankId, setBankId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    fetchBanks();
    if (id) fetchAccount();

    const appConfigStr = typeof window !== 'undefined' ? localStorage.getItem('application') : null;
    if (appConfigStr) {
        try {
            const appConfig = JSON.parse(appConfigStr);
            setApplicationData({
                name: appConfig.name || 'XinXun',
                healthy: appConfig.healthy || false,
            });
        } catch (e) {
            setApplicationData({ name: 'XinXun', healthy: false });
        }
    }
  }, [id]);

  const fetchBanks = async () => {
    try {
      const banksRes = await getBankList();
      setBanks(banksRes.data.banks || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const fetchAccount = async () => {
    setIsLoading(true);
    try {
      const res = await getBankAccountById(id);
      let acc = res.data.bank_account;
      if (Array.isArray(acc)) {
        acc = acc[0];
      }
      if (acc) {
        setBankId(acc.bank_id ? acc.bank_id.toString() : '');
        setBankAccount(acc.account_number || '');
        setFullName(acc.account_name || '');
      } else {
        setMessage('Data rekening tidak ditemukan');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await editBankAccount({
        id: parseInt(id, 10),
        bank_id: parseInt(bankId, 10),
        account_number: String(bankAccount),
        account_name: String(fullName)
      });
      setMessage(res.message);
      setMessageType('success');
      setTimeout(() => router.push('/bank'), 1500);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const primaryColor = '#fe7d17';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Memuat data rekening...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Perbarui Rekening</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Edit Bank Account`} />
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
              <Icon icon="mdi:bank-transfer" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Perbarui Rekening</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Header Info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Icon icon="mdi:bank-transfer" className="text-xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Perbarui Rekening</h2>
              <p className="text-sm text-gray-600">Perbarui informasi rekening bank Anda</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Icon icon="mdi:bank" className="w-4 h-4" style={{ color: primaryColor }} />
                Pilih Bank
              </label>
              <select
                value={bankId}
                onChange={e => setBankId(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-[#fe7d17] font-medium appearance-none"
                required
              >
                <option value="">Pilih Bank Anda</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Icon icon="mdi:credit-card-outline" className="w-4 h-4" style={{ color: primaryColor }} />
                Nomor Rekening
              </label>
              <input
                type="text"
                placeholder="Masukkan nomor rekening"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-[#fe7d17] font-medium placeholder-gray-400"
                required
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Icon icon="mdi:account-outline" className="w-4 h-4" style={{ color: primaryColor }} />
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                placeholder="Sesuai dengan nama di rekening bank"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-[#fe7d17] font-medium placeholder-gray-400"
                required
              />
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-xl border ${
                messageType === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Icon
                    icon={messageType === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  <span className="text-sm font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !bankId || !bankAccount || !fullName}
              className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan Perubahan...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:information-variant" className="w-5 h-5 text-blue-600" />
            Perhatian
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">Pastikan data yang diubah sudah benar sebelum menyimpan</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="mdi:shield-check" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">Rekening harus tetap aktif dan dapat menerima transfer</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="mdi:refresh" className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">Periksa kembali data sebelum menyimpan perubahan</p>
            </div>
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
}
