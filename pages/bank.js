import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { getBankAccounts, deleteBankAccount } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';

export default function BankAccount() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, account: null });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    fetchData();

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
  }, []);

  // Hoisted function so it can be called from useEffect above
  async function fetchData() {
    setLoading(true);
    try {
      const bankRes = await getBankAccounts();
      setBankAccounts(bankRes.data.bank_account || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClick = (account) => {
    setDeleteModal({ show: true, account });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.account) return;

    setMessage('');
    try {
      const res = await deleteBankAccount(deleteModal.account.id);
      setMessage(res.message);
      setMessageType('success');
      fetchData();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }

    setDeleteModal({ show: false, account: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, account: null });
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Akun Bank</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Bank Accounts`} />
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
              <Icon icon="mdi:bank" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Rekening Bank</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Floating Message */}
        {message && (
          <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full mx-4 ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : messageType === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              <Icon
                icon={messageType === 'success' ? 'mdi:check-circle' : messageType === 'error' ? 'mdi:alert-circle' : 'mdi:information'}
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Header Info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Icon icon="mdi:bank-outline" className="text-xl text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900 mb-1">Rekening Bank</h2>
              <p className="text-sm text-gray-600">Kelola rekening untuk penarikan dana</p>
            </div>
          </div>

          <Link href="/bank/add">
            <button
              className="w-full py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <Icon icon="mdi:plus-circle" className="w-5 h-5" />
              Tambah Rekening Baru
            </button>
          </Link>
        </div>

        {/* Bank Accounts List */}
        <div className="space-y-3 mb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Icon icon="mdi:bank-off-outline" className="text-gray-400 w-8 h-8" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Belum Ada Rekening</h3>
              <p className="text-gray-500 text-sm">Tambahkan rekening untuk memulai penarikan</p>
            </div>
          ) : (
            bankAccounts.map(account => (
              <div key={account.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:bank" className="text-2xl text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-bold text-sm mb-1">{account.bank_name}</h3>
                    <p className="text-gray-700 font-medium text-sm mb-0.5">{account.account_number}</p>
                    <p className="text-gray-500 text-xs truncate">{account.account_name}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/bank/edit?id=${account.id}`}>
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(account)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Icon icon="mdi:delete" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon icon="mdi:lightbulb-on-outline" className="w-5 h-5 text-yellow-500" />
            Tips Keamanan
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">Pastikan nama pemilik rekening sesuai dengan identitas Anda</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="mdi:shield-check" className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">Gunakan nomor rekening yang valid dan aktif</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">Rekening yang telah digunakan untuk penarikan tidak dapat dihapus</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-xs py-6">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:alert-circle-outline" className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Rekening?</h3>
              <p className="text-gray-600 mb-1 text-sm">Anda yakin ingin menghapus rekening:</p>
              <p className="text-gray-900 font-semibold mb-4 text-sm">{deleteModal.account?.bank_name} - {deleteModal.account?.account_number}</p>
              <p className="text-red-600 text-xs mb-6">Tindakan ini tidak dapat dibatalkan</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
