// pages/transactions.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import { getUserTransactions } from '../utils/api';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Semua', icon: 'mdi:view-list' },
    { value: 'investment', label: 'Investasi', icon: 'mdi:trending-up' },
    { value: 'withdrawal', label: 'Penarikan', icon: 'mdi:bank-transfer-out' },
    { value: 'return', label: 'Return', icon: 'mdi:cash-refund' },
    { value: 'team', label: 'Tim', icon: 'mdi:account-group' },
    { value: 'bonus', label: 'Bonus', icon: 'mdi:gift' }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    fetchTransactions();
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
    // Reset page to 1 when filter changes
    setPage(1);
  }, [selectedFilter]);

  useEffect(() => {
    // Fetch data when page changes, filter changes, or search changes
    fetchTransactions();
    // Scroll to top of list
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.log('Scroll failed:', e);
    }
  }, [page, selectedFilter, debouncedSearchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const queryParams = {
        limit: 10, // Fixed limit
        page,
        ...(selectedFilter !== 'all' && { type: selectedFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      console.log('Fetching transactions with params:', queryParams); // Debug log
      console.log('Selected filter:', selectedFilter); // Debug log

      const res = await getUserTransactions(queryParams);

      if (res.success && res.data) {
        // Handle new response structure: data.data and data.pagination
        const responseData = res.data.data || res.data;
        const fetchedTransactions = Array.isArray(responseData.data) 
          ? responseData.data 
          : (Array.isArray(responseData.transactions) 
            ? responseData.transactions 
            : (Array.isArray(responseData) ? responseData : []));
        
        setTransactions(fetchedTransactions);

        // Handle pagination metadata - new structure with data.pagination
        const pagination = res.data.pagination || res.data.meta || {};
        if (pagination.total_rows !== undefined) {
          setTotalTransactions(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
          setHasNextPage((pagination.page || page) < (pagination.total_pages || 1));
        } else {
          // Fallback: determine if there's a next page based on returned data
          setTotalTransactions(fetchedTransactions.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedTransactions.length / limit)));
          setHasNextPage(fetchedTransactions.length === limit);
        }

        // Apply client-side filtering if needed (for backward compatibility)
        filterTransactions(fetchedTransactions);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        setTotalTransactions(0);
        setTotalPages(1);
        setHasNextPage(false);
        if (!res.success) {
          setError(res.message || 'Gagal memuat riwayat transaksi');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching transactions:', err);
      setTransactions([]);
      setFilteredTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
      setHasNextPage(false);
    }
    setLoading(false);
  };

  const filterTransactions = (transactionList = transactions) => {
    // Since we're doing server-side filtering now, this function mainly sets the filtered transactions
    // But we keep it for backward compatibility or if API doesn't support filtering
    if (selectedFilter === 'all') {
      setFilteredTransactions(transactionList);
    } else {
      // If API doesn't filter on server-side, filter client-side as fallback
      const filtered = transactionList.filter(tx =>
        tx.transaction_type === selectedFilter
      );
      setFilteredTransactions(filtered);
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
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
        <Icon icon={config.icon} className={`w-3.5 h-3.5 ${config.color}`} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const getTxIcon = (type) => {
    switch (type) {
      case 'withdrawal':
        return 'mdi:bank-transfer-out';
      case 'bonus':
        return 'mdi:gift';
      case 'team':
        return 'mdi:account-group';
      case 'return':
        return 'mdi:cash-refund';
      case 'investment':
        return 'mdi:trending-up';
      default:
        return 'mdi:currency-usd';
    }
  };

  const getTxTypeColor = (type) => {
    switch (type) {
      case 'withdrawal':
        return 'bg-red-50 border-red-200 text-red-600';
      case 'bonus':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'team':
        return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'return':
        return 'bg-purple-50 border-purple-200 text-purple-600';
      case 'investment':
        return 'bg-orange-50 border-orange-200 text-orange-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const calculateStatistics = () => {
    const totalCount = filteredTransactions.length;
    const successfulTransactions = filteredTransactions.filter(tx => tx.status === 'Success');

    const totalCredit = successfulTransactions
      .filter(tx => tx.transaction_flow === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const totalDebit = successfulTransactions
      .filter(tx => tx.transaction_flow === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalTransactions: totalCount,
      totalCredit,
      totalDebit,
      netBalance: totalDebit - totalCredit
    };
  };

  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    // Page will be reset to 1 automatically by useEffect
  };

  const handlePageChange = (newPage) => {
    console.log('handlePageChange called with:', newPage, 'current page:', page);
    if (newPage >= 1 && newPage !== page) {
      console.log('Setting page to:', newPage);
      setPage(newPage);
    }
  };

  const stats = calculateStatistics();

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Riwayat Transaksi</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Transaction History`} />
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
              <Icon icon="mdi:swap-horizontal-bold" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Riwayat Transaksi</h1>
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
              <span className="text-gray-600 text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Icon icon="mdi:scale-balance" className="text-green-600 w-4 h-4" />
              </div>
              <span className="text-gray-600 text-xs font-medium">Saldo Bersih</span>
            </div>
            <p className={`text-lg font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {formatCurrency(Math.abs(stats.netBalance))}
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

        {/* Filter Tabs */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategori Transaksi</h3>
          <div 
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                  selectedFilter === option.value
                    ? 'text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                style={selectedFilter === option.value ? { backgroundColor: primaryColor } : {}}
              >
                <Icon icon={option.icon} className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {/* Transaction List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 && !error ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:database-off" className="text-gray-400 w-7 h-7" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Belum Ada Transaksi</h3>
            <p className="text-gray-600 text-sm">Tidak ada transaksi untuk filter ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTxTypeColor(tx.transaction_type)}`}>
                      <Icon icon={getTxIcon(tx.transaction_type)} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 capitalize">
                        {tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                      </p>
                      <p className="text-[10px] text-gray-500">#{tx.order_id}</p>
                    </div>
                  </div>
                  {getStatusBadge(tx.status)}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Message */}
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {tx.message}
                  </p>

                  {/* Amount Section */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{tx.transaction_flow === 'debit' ? 'Dana Masuk' : 'Dana Keluar'}</p>
                      <p className={`text-lg font-bold ${tx.transaction_flow === 'debit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.transaction_flow === 'debit' ? '+' : '-'} Rp {formatCurrency(tx.amount || 0)}
                      </p>
                    </div>
                    {(tx.charge || 0) > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Biaya</p>
                        <p className="text-sm font-bold" style={{ color: primaryColor }}>
                          Rp {formatCurrency(tx.charge || 0)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Icon icon="mdi:calendar-clock" className="w-3.5 h-3.5" />
                      <span>
                        {tx.created_at
                          ? formatDate(tx.created_at)
                          : (() => {
                              const orderIdMatch = tx.order_id?.match(/INV-(\d{13})/);
                              if (orderIdMatch) {
                                const timestamp = parseInt(orderIdMatch[1]);
                                if (!isNaN(timestamp) && timestamp > 1000000000000) {
                                  return formatDate(new Date(timestamp));
                                }
                              }
                              return 'N/A';
                            })()
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">
                Halaman {page} dari {totalPages} • {totalTransactions} transaksi total
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
