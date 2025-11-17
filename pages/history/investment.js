// pages/history/investment.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getInvestmentHistory, getPaymentByOrderId } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function RiwayatDeposit() {
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({}); // { order_id: { status, expired_at, payment_method, product } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit to 10
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    fetchInvestmentHistory();
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
    fetchInvestmentHistory();
    // Scroll to top of list
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.log('Scroll failed:', e);
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
  }, [page, debouncedSearchTerm]);

  const fetchInvestmentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const queryParams = {
        limit: 10, // Fixed limit to 10
        page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      console.log('Fetching investment history with params:', queryParams); // Debug log

      const res = await getInvestmentHistory(queryParams);
      if (res.success && res.data) {
        // Handle new response structure: data.data and data.pagination
        const responseData = res.data.data || res.data;
        const fetchedInvestments = Array.isArray(responseData.data) 
          ? responseData.data 
          : (Array.isArray(responseData.investments) 
            ? responseData.investments 
            : (Array.isArray(responseData) ? responseData : []));
        
        setInvestments(fetchedInvestments);

        // Handle pagination metadata - new structure with data.pagination
        const pagination = res.data.pagination || {};
        if (pagination.total_rows !== undefined) {
          setTotalInvestments(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
        } else {
          // Fallback: determine pagination based on returned data
          setTotalInvestments(fetchedInvestments.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedInvestments.length / limit)));
        }

        // Ambil status pembayaran untuk setiap investasi
        const statusObj = {};
        await Promise.all(
          fetchedInvestments.map(async (inv) => {
            try {
              const payRes = await getPaymentByOrderId(inv.order_id);
              if (payRes.success && payRes.data) {
                statusObj[inv.order_id] = {
                  status: payRes.data.status,
                  expired_at: payRes.data.expired_at,
                  payment_method: payRes.data.payment_method,
                  product: payRes.data.product
                };
              } else {
                statusObj[inv.order_id] = {
                  status: inv.status || 'Unknown',
                  expired_at: null,
                  payment_method: null,
                  product: null
                };
              }
            } catch {
              statusObj[inv.order_id] = {
                status: inv.status || 'Unknown',
                expired_at: null,
                payment_method: null,
                product: null
              };
            }
          })
        );
        setPaymentStatus(statusObj);
      } else {
        setInvestments([]);
        setPaymentStatus({});
        setTotalInvestments(0);
        setTotalPages(1);
        setError(res.message || 'Gagal memuat riwayat investasi');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching investment history:', err);
      setInvestments([]);
      setPaymentStatus({});
      setTotalInvestments(0);
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

  const getStatusConfig = (status, expired_at) => {
    // Cek expired untuk status Pending
    if (status === 'Pending' && expired_at) {
      const expiredDate = new Date(expired_at);
      const now = new Date();
      const diff = (expiredDate.getTime() - now.getTime()) / 1000;
      if (diff < 0) {
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          text: 'Kadaluarsa',
          icon: 'mdi:timer-off'
        };
      }
    }

    const statusConfig = {
      'Success': {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        text: 'Berhasil',
        icon: 'mdi:check-circle'
      },
      'Completed': {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        text: 'Berhasil',
        icon: 'mdi:check-circle'
      },
      'Running': {
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        text: 'Berhasil',
        icon: 'mdi:play-circle'
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
      },
      'Expired': {
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        text: 'Kadaluarsa',
        icon: 'mdi:timer-off'
      }
    };

    return statusConfig[status] || statusConfig['Pending'];
  };

  const getStatusBadge = (status, expired_at) => {
    const config = getStatusConfig(status, expired_at);

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
        <Icon icon={config.icon} className={`w-3.5 h-3.5 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const shouldShowPayButton = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      const expiredDate = new Date(expired_at);
      const now = new Date();
      const diff = (expiredDate.getTime() - now.getTime()) / 1000;
      return diff > 0; // Masih belum expired
    }
    return false;
  };

  const primaryColor = '#fe7d17';

  if (loading && investments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Riwayat Investasi</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Investment History`} />
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
              <Icon icon="mdi:history" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Riwayat Investasi</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:counter" className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Transaksi</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalInvestments}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon icon="mdi:cash-multiple" className="text-green-600 w-4 h-4" />
              </div>
              <span className="text-gray-600 text-xs font-medium">Total Investasi</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              Rp {formatCurrency(
                investments.reduce((sum, inv) => {
                  const status = paymentStatus[inv.order_id]?.status || inv.status;
                  return ['Success', 'Completed', 'Running'].includes(status)
                    ? sum + (inv.amount || 0)
                    : sum;
                }, 0)
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Investments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Memuat riwayat investasi...</p>
          </div>
        ) : investments.length === 0 && !error ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:database-off" className="text-gray-400 w-7 h-7" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Belum Ada Riwayat</h3>
            <p className="text-gray-600 text-sm">Anda belum melakukan pembelian investasi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((investment) => {
              const paymentInfo = paymentStatus[investment.order_id] || {};
              const status = paymentInfo.status || investment.status;
              const showPayButton = shouldShowPayButton(status, paymentInfo.expired_at);

              return (
                <div key={investment.id || investment.order_id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Icon icon="mdi:chart-line" className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 truncate">{paymentInfo.product || 'Paket Investasi'}</p>
                        <p className="text-[10px] text-gray-500">#{investment.order_id}</p>
                      </div>
                    </div>
                    {getStatusBadge(status, paymentInfo.expired_at)}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Amount */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Jumlah Investasi</p>
                      <p className="text-2xl font-bold text-gray-900">
                        Rp {formatCurrency(investment.amount || 0)}
                      </p>
                    </div>

                    {/* Date Info */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                      <Icon icon="mdi:calendar-clock" className="w-3.5 h-3.5" />
                      <span>
                        {investment.created_at ?
                          formatDate(investment.created_at) :
                          new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
                        }
                      </span>
                    </div>

                    {/* Payment Button */}
                    {showPayButton && (
                      <div className="pt-3 border-t border-gray-100">
                        <button
                          onClick={() => router.push(`/payment?order_id=${investment.order_id}`)}
                          className="w-full text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-md"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Icon icon="mdi:credit-card-outline" className="w-5 h-5" />
                          <span>Bayar Sekarang</span>
                        </button>
                        {paymentInfo.expired_at && (
                          <div className="flex items-center justify-center gap-1.5 mt-2 px-3 py-1.5 bg-yellow-50 border border-yellow-100 rounded-lg">
                            <Icon icon="mdi:clock-alert-outline" className="w-3.5 h-3.5 text-yellow-700" />
                            <span className="text-[10px] text-yellow-700 font-semibold">
                              Batas: {formatDate(paymentInfo.expired_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {investments.length > 0 && (
          <div className="mt-6">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">
                Halaman {page} dari {totalPages} • {totalInvestments} investasi total
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
        <div className="text-center text-gray-400 text-xs py-6">
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
