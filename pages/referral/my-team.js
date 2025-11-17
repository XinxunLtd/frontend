import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getTeamInvitedByLevel, getTeamDataByLevel } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function Team() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const { level } = router.query;
  const [teamData, setTeamData] = useState({
    level: null,
    totalInvestment: 0,
    activeMembers: 0,
    members: [],
    pagination: {
      limit: 10,
      page: 1,
      total_pages: 0,
      total_rows: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  async function fetchData(cancelToken) {
    setLoading(true);
    try {
      const statsRes = await getTeamInvitedByLevel(level);
      const stats = statsRes?.data?.[level] || { active: 0, count: 0, total_invest: 0 };

      const membersRes = await getTeamDataByLevel(level, { 
        limit, 
        page, 
        search: debouncedSearchTerm 
      });
      
      // Handle new response structure
      const responseData = membersRes?.data || {};
      const membersArr = responseData.members || [];
      const pagination = responseData.pagination || {
        limit: limit,
        page: page,
        total_pages: 0,
        total_rows: 0,
      };
      const responseLevel = responseData.level || level;

      const members = membersArr.map((m, idx) => {
        let phone = (m.number || '').toString();
        if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
        else if (phone.startsWith('+62')) phone = phone.slice(1);
        else if (phone.startsWith('62')) phone = phone;
        else if (phone.length > 0) phone = `62${phone}`;
        return {
          id: (page - 1) * limit + idx + 1,
          phone,
          name: m.name,
          investment: m.total_invest || 0,
          status: m.active ? 'active' : 'inactive',
        };
      });

      if (!cancelToken?.current) {
        setTeamData({
          level: responseLevel,
          totalInvestment: stats.total_invest || 0,
          activeMembers: stats.active || 0,
          members,
          pagination,
        });
      }
    } catch (e) {
      if (!cancelToken?.current) {
        setTeamData({ 
          level: null,
          totalInvestment: 0, 
          activeMembers: 0, 
          members: [], 
          pagination: {
            limit: limit,
            page: page,
            total_pages: 0,
            total_rows: 0,
          },
        });
      }
    } finally {
      if (!cancelToken?.current) setLoading(false);
    }
  }

  const prevLevelRef = useRef();
  const searchDebounceRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search changes
      setPage(1);
    }, 500); // 500ms debounce

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
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

    if (!level) return;
    const cancelToken = { current: false };

    const levelChanged = prevLevelRef.current !== level;
    if (levelChanged) {
      prevLevelRef.current = level;
      if (page !== 1) {
        setPage(1);
        return () => { cancelToken.current = true; };
      }
    }

    fetchData(cancelToken);
    return () => { cancelToken.current = true; };
  }, [level, page, debouncedSearchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter members by status only (search is handled by API)
  const filteredMembers = teamData.members.filter(member => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesStatus;
  });

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Tim Level {level}</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Team`} />
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
              <Icon icon="mdi:account-group" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Tim Level {level}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Hero Stats - Centered Layout */}
        <div className="mb-6 text-center">
          <p className="text-xs font-medium text-gray-500 mb-2">Total Investasi Level {level}</p>
          <h2 className="text-4xl font-black mb-4" style={{ color: primaryColor }}>
            {formatCurrency(teamData.totalInvestment)}
          </h2>

          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-gray-900">{teamData.activeMembers}</p>
              <p className="text-xs text-gray-500 mt-1">Aktif</p>
            </div>
            <div className="w-px h-12 bg-gray-300" />
          <div>
            <p className="text-3xl font-bold text-gray-900">{teamData.pagination.total_rows}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          </div>
        </div>

        {/* Floating Search */}
        <div className="mb-4 bg-white rounded-2xl border border-gray-200 p-3">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#fe7d17] placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 justify-between">
          <button
            onClick={() => setFilterStatus('all')}
            className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
              filterStatus === 'all'
                ? 'text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
            style={filterStatus === 'all' ? { backgroundColor: primaryColor } : {}}
          >
            Semua ({teamData.members.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
              filterStatus === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Aktif ({teamData.activeMembers})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
              filterStatus === 'inactive'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Tidak Aktif ({teamData.pagination.total_rows - teamData.activeMembers})
          </button>
        </div>

        {/* Members List - Table Style */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="space-y-2 mb-6">
            {filteredMembers.map((member, idx) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Number Badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    {idx + 1 + (page - 1) * limit}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{member.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.status === 'active' ? '● Aktif' : '○ Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">+{member.phone}</span>
                      <span className="font-semibold" style={{ color: primaryColor }}>
                        {formatCurrency(member.investment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : teamData.members.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <Icon icon="mdi:account-group-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900 mb-2">Belum Ada Member</h4>
            <p className="text-sm text-gray-500 mb-4">Tim level {level} Anda masih kosong</p>
            <button
              onClick={() => router.push('/referral')}
              className="px-5 py-2.5 rounded-xl font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Mulai Referral
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Icon icon="mdi:magnify-close" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 text-sm mb-1">Tidak Ada Hasil</h4>
            <p className="text-xs text-gray-500">Tidak ditemukan member yang sesuai</p>
          </div>
        )}

        {/* Pagination */}
        {teamData.members.length > 0 && (
          <div className="mb-6">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-500">
                Halaman {page} dari {teamData.pagination.total_pages} • {teamData.pagination.total_rows} member total
              </p>
            </div>
            <Pagination
              currentPage={page}
              totalPages={teamData.pagination.total_pages}
              onPageChange={handlePageChange}
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-6">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Nav */}
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
