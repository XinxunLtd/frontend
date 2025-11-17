// pages/history/withdraw.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getWithdrawalHistory } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function RiwayatWithdraw() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit to 10
  const [totalPages, setTotalPages] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    fetchWithdrawalHistory();
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search changes
      setPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Fetch data when page changes or search changes
    fetchWithdrawalHistory();
    // Scroll to top of list
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.log('Scroll failed:', e);
    }
  }, [page, debouncedSearchTerm]);

  const fetchWithdrawalHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const queryParams = {
        limit: 10, // Fixed limit to 10
        page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      console.log('Fetching withdrawal history with params:', queryParams); // Debug log

      const res = await getWithdrawalHistory(queryParams);
      if (res.success && res.data) {
        // Handle new response structure: data.data and data.pagination
        const responseData = res.data.data || res.data;
        const fetchedWithdrawals = Array.isArray(responseData.data) 
          ? responseData.data 
          : (Array.isArray(responseData) && responseData !== null ? responseData : []);
        
        setWithdrawals(fetchedWithdrawals);

        // Handle pagination metadata - new structure with data.pagination
        const pagination = res.data.pagination || {};
        if (pagination.total_rows !== undefined) {
          setTotalWithdrawals(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
        } else {
          // Fallback: determine pagination based on returned data
          setTotalWithdrawals(fetchedWithdrawals.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedWithdrawals.length / limit)));
        }

        setError(null);
      } else {
        setWithdrawals([]);
        setTotalWithdrawals(0);
        setTotalPages(1);
        setError(res.message || 'Gagal memuat riwayat penarikan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching withdrawal history:', err);
      setWithdrawals([]);
      setTotalWithdrawals(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    console.log('handlePageChange called with:', newPage, 'current page:', page);
    if (newPage >= 1 && newPage !== page) {
      console.log('Setting page to:', newPage);
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      'Success': {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        text: 'Berhasil',
        icon: 'mdi:check-circle'
      },
      'Pending': {
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        text: 'Menunggu',
        icon: 'mdi:clock-outline'
      },
      'Failed': {
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        text: 'Gagal',
        icon: 'mdi:close-circle'
      }
    };

    return statusConfig[status] || statusConfig['Pending'];
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
        <Icon icon={config.icon} className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Riwayat Penarikan</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Withdrawal History`} />
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
              <Icon icon="mdi:cash-clock" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Riwayat Penarikan</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <Icon icon="mdi:cash-clock" className="w-7 h-7" style={{ color: primaryColor }} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Riwayat Penarikan</h2>
          <p className="text-gray-600 text-sm">
            Lihat semua transaksi penarikan dana Anda
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:counter" className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Transaksi</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalWithdrawals}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon icon="mdi:cash-multiple" className="text-green-600 w-4 h-4" />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Ditarik</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(
                withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)
              )}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4 bg-white rounded-2xl border border-gray-200 p-3">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#fe7d17] placeholder-gray-400 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm leading-relaxed">{error}</span>
          </div>
        )}

        {/* Withdrawals List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat riwayat penarikan...</p>
          </div>
        ) : withdrawals.length === 0 && !error ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Icon icon="mdi:database-off" className="text-gray-300 w-12 h-12 mx-auto mb-3" />
            <h3 className="text-gray-900 font-bold mb-1">Belum Ada Riwayat</h3>
            <p className="text-gray-500 text-sm">Anda belum melakukan penarikan dana</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {withdrawals.map((withdrawal, index) => {
              const statusConfig = getStatusConfig(withdrawal.status);
              return (
                <div key={withdrawal.id || index} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="mdi:bank-transfer-out" className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">#{withdrawal.order_id}</p>
                        <p className="text-[10px] text-gray-500">
                          {withdrawal.withdrawal_time ? formatDate(withdrawal.withdrawal_time) : `ID: ${withdrawal.id || index}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Bank Info */}
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="mdi:bank" className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-bold text-gray-900">{withdrawal.bank_name || 'Bank Tidak Diketahui'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Icon icon="mdi:account-circle-outline" className="w-3.5 h-3.5" />
                        <span>{withdrawal.account_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Icon icon="mdi:credit-card-outline" className="w-3.5 h-3.5" />
                        <span>{withdrawal.account_number || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Jumlah Penarikan</span>
                        <span className="text-sm font-bold text-gray-900">Rp {formatCurrency(withdrawal.amount || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Biaya Admin</span>
                        <span className="text-sm font-bold text-red-600">- Rp {formatCurrency(withdrawal.charge || 0)}</span>
                      </div>
                    </div>

                    {/* Final Amount */}
                    <div className={`rounded-lg p-3 ${statusConfig.bgColor} border-2 ${statusConfig.borderColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:cash-check" className={`w-4 h-4 ${statusConfig.color}`} />
                          <span className={`text-xs font-semibold ${statusConfig.color}`}>
                            Diterima
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${statusConfig.color}`}>
                          Rp {formatCurrency(withdrawal.final_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {withdrawals.length > 0 && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">
                Halaman {page} dari {totalPages} • {totalWithdrawals} penarikan total
              </p>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </div>
        )}

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

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange, primaryColor }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        <Icon icon="mdi:chevron-left" className="w-4 h-4 text-gray-600" />
      </button>

      {getPageNumbers().map((pageNum, idx) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
              currentPage === pageNum
                ? 'text-white shadow-sm'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            style={currentPage === pageNum ? { backgroundColor: primaryColor } : {}}
          >
            {pageNum}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
