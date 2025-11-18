import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getForumTestimonials } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

const S3_ENDPOINT = process.env.NEXT_PUBLIC_S3_ENDPOINT;
const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;

export default function Testimoni() {
    const router = useRouter();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalImage, setModalImage] = useState(null);
    const [applicationData, setApplicationData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalTestimonials, setTotalTestimonials] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const primaryColor = '#fe7d17';

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (!token || !accessExpire) {
          router.push('/login');
          return;
        }
        const fetchTestimonials = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getForumTestimonials({ limit, page });
                
                // Handle new response structure: data.data and data.pagination
                let rawItems = [];
                
                // First check new structure: res.data.data (array)
                if (res.data?.data && Array.isArray(res.data.data)) {
                    rawItems = res.data.data;
                }
                // Check if res.data.data is an object with nested data/items/testimonials
                else if (res.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data)) {
                    if (Array.isArray(res.data.data.data)) {
                        rawItems = res.data.data.data;
                    } else if (Array.isArray(res.data.data.items)) {
                        rawItems = res.data.data.items;
                    } else if (Array.isArray(res.data.data.testimonials)) {
                        rawItems = res.data.data.testimonials;
                    }
                }
                // Check old structure: res.data.items
                else if (res.data?.items && Array.isArray(res.data.items)) {
                    rawItems = res.data.items;
                }
                // Check old structure: res.data.testimonials
                else if (res.data?.testimonials && Array.isArray(res.data.testimonials)) {
                    rawItems = res.data.testimonials;
                }
                // Check if res.data is directly an array
                else if (Array.isArray(res.data)) {
                    rawItems = res.data;
                }
                // Default to empty array
                else {
                    rawItems = [];
                }
                
                // Ensure rawItems is always an array before filtering
                if (!Array.isArray(rawItems)) {
                    rawItems = [];
                }
                
                // Filter only accepted testimonials
                const items = rawItems.filter(t => t && t.status === 'Accepted');
                setTestimonials(items);

                // Handle pagination metadata - new structure with data.pagination
                const pagination = res.data?.pagination || {};
                console.log('📊 Pagination Debug:', {
                    hasData: !!res.data,
                    hasPagination: !!res.data?.pagination,
                    paginationData: pagination,
                    itemsLength: items.length,
                    rawItemsLength: rawItems.length
                });

                if (pagination.total_rows !== undefined) {
                    setTotalTestimonials(pagination.total_rows || 0);
                    setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
                    console.log('✅ Using API pagination:', { total_rows: pagination.total_rows, total_pages: pagination.total_pages });
                } else {
                    // Fallback: use old structure
                const total = res.data?.total || res.data?.total_count || res.total || items.length;
                setTotalTestimonials(typeof total === 'number' ? total : Number(total) || items.length);
                    setTotalPages(Math.max(1, Math.ceil((typeof total === 'number' ? total : Number(total) || items.length) / limit)));
                    console.log('⚠️ Using fallback pagination:', { total, calculatedPages: Math.ceil((typeof total === 'number' ? total : Number(total) || items.length) / limit) });
                }
            } catch (err) {
                setError(err.message || 'Gagal memuat testimoni');
                setTestimonials([]);
                setTotalTestimonials(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUserData({
              name: parsed.name || '',
              balance: parsed.balance || 0,
              active: parsed.active || false,
              level: parsed.level || 0,
              total_invest: parsed.total_invest || 0,
              total_invest_vip: parsed.total_invest_vip || 0
            });
          } catch (e) {
            setUserData({ name: '', balance: 0, active: false, level: 0 });
          }
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
    }, [page, limit]);

    const formatDate = (dateString) => {
        const d = new Date(dateString.replace(' ', 'T'));
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handlePageChange = (newPage) => {
        console.log('handlePageChange called with:', newPage, 'current page:', page);
        if (newPage >= 1 && newPage !== page) {
            console.log('Setting page to:', newPage);
            setPage(newPage);
        }
    };

    const ImageModal = ({ url, onClose }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
          <div className="relative max-w-full max-h-full p-4" onClick={e => e.stopPropagation()}>
            <Image
              src={url}
              alt="Bukti Penarikan"
              unoptimized
              width={500}
              height={500}
              className="rounded-xl shadow-2xl max-h-[80vh] w-auto object-contain"
            />
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
              aria-label="Tutup"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>
        </div>
    );

    return (
      <div className="min-h-screen bg-white pb-20">
        <Head>
          <title>{applicationData?.name || 'XinXun'} | Forum Testimoni</title>
          <meta name="description" content={`${applicationData?.name || 'XinXun'} Testimonials`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {modalImage && <ImageModal url={modalImage} onClose={() => setModalImage(null)} />}

        {/* Simple Top Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src="/cover_logo.png"
                alt="XinXun Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/vip')}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5"
              >
                <Icon icon="mdi:crown" className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-sm font-semibold text-[#fe7d17]">VIP {userData?.level || 0}</span>
              </button>
              <button 
                onClick={() => router.push('/portofolio')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <Icon icon="mdi:chart-box" className="w-5 h-5" style={{ color: primaryColor }} />
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm px-4 pt-4 pb-6">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Forum Testimoni</h1>
                <p className="text-xs text-gray-500 mt-0.5">{totalTestimonials} testimoni terverifikasi</p>
              </div>
              <button
                onClick={() => router.push('/forum/upload')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Icon icon="mdi:plus" className="w-4 h-4" />
                Upload
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2.5 flex items-start gap-2">
              <Icon icon="mdi:gift-outline" className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-900">Dapatkan Bonus!</p>
                <p className="text-[11px] text-orange-700 mt-0.5">Rp 2.000 - Rp 20.000 per testimoni terverifikasi</p>
              </div>
            </div>
          </div>
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-orange-500 animate-spin mb-3"></div>
              <p className="text-sm text-gray-600">Memuat testimoni...</p>
              </div>
            )}

          {/* Error State */}
            {error && !loading && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-4 text-center">
              <Icon icon="mdi:alert-circle-outline" className="mx-auto w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              </div>
            )}

          {/* Empty State */}
            {!loading && !error && testimonials.length === 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-12 text-center">
              <Icon icon="mdi:forum-outline" className="mx-auto w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-800">Belum Ada Testimoni</p>
              <p className="mt-1 text-xs text-gray-500 mb-4">Jadilah yang pertama membagikan pengalaman Anda</p>
            <button
                onClick={() => router.push('/forum/upload')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                <Icon icon="mdi:upload" className="w-4 h-4" />
                Upload Sekarang
            </button>
            </div>
          )}

          {/* Testimonials Grid */}
          {!loading && !error && testimonials.length > 0 && (
            <div className="space-y-3">
              {testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  t={t}
                  setModalImage={setModalImage}
                  formatCurrency={formatCurrency}
                  primaryColor={primaryColor}
                />
              ))}
          </div>
          )}

          {/* Pagination */}
          {!loading && !error && testimonials.length > 0 && (
            <div className="mt-6">
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500">
                  Halaman {page} dari {totalPages} • {totalTestimonials} forum total
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

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 py-4">
            © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-sm">
            <BottomNavbar />
          </div>
        </div>
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

// Testimonial Card Component
function TestimonialCard({ t, setModalImage, formatCurrency, primaryColor }) {
    const [imgUrl, setImgUrl] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (t.image) {
            fetch(`/api/s3-image?key=${encodeURIComponent(t.image)}`)
                .then(res => res.json())
                .then(data => { if (isMounted && data.url) setImgUrl(data.url); });
        }
        return () => { isMounted = false; };
    }, [t.image]);

    return (
      <div className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:account" className="w-5 h-5 text-white" />
            </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
            <div>
                <p className="text-sm font-bold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">+62{String(t.number).replace(/^\+?62|^0/, '')}</p>
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                style={{ backgroundColor: primaryColor }}
              >
                <Icon icon="mdi:gift" className="w-3.5 h-3.5" />
                {formatCurrency(t.reward)}
              </div>
            </div>
          </div>
        </div>

            {t.image && imgUrl && (
          <button
            type="button"
            onClick={() => setModalImage(imgUrl)}
            className="w-full mb-3 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
          >
                <Image
                  src={imgUrl}
                  alt="bukti penarikan"
                  unoptimized
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
          </button>
        )}

        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                {t.description}
              </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Icon icon="mdi:clock-outline" className="w-4 h-4" />
          <span>
              {new Date(t.time.replace(' ', 'T')).toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              })}
            </span>
        </div>
      </div>
    );
}