// pages/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProducts } from '../utils/api';
import { BANKS, PAYMENT_METHODS } from '../constants/products';
import InvestmentModal from '../components/InvestmentModal';
import Toast from '../components/Toast';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [products, setProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Router');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [hidePopupChecked, setHidePopupChecked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    const storedApplication = localStorage.getItem('application');
    
    const popupHiddenUntil = localStorage.getItem('popupHiddenUntil');
    const now = new Date().getTime();
    
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

    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'XinXun',
          healthy: parsed.healthy || false,
          link_app: parsed.link_app,
          link_cs: parsed.link_cs,
          link_group: parsed.link_group,
          logo: parsed.logo,
          max_withdraw: parsed.max_withdraw,
          min_withdraw: parsed.min_withdraw,
          withdraw_charge: parsed.withdraw_charge
        });
      } catch (e) {
        setApplicationData({ name: 'XinXun', healthy: false });
      }
    } else {
      setApplicationData({ name: 'XinXun', healthy: false });
    }
    
    fetchProducts();

    if (!popupHiddenUntil || now > parseInt(popupHiddenUntil)) {
      const popupTimer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000);
      return () => clearTimeout(popupTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (products[selectedCategory] && products[selectedCategory].length > 0 && !selectedProduct) {
      setSelectedProduct(products[selectedCategory][0]);
    }
  }, [products, selectedCategory, selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts((data && data.data) ? data.data : {});
      
      if (data && data.data) {
        const categories = Object.keys(data.data);
        const preferred = ['Router', 'Mifi', 'Powerbank'];
        const orderedCategories = [
          ...preferred.filter(k => categories.includes(k)),
          ...categories.filter(k => !preferred.includes(k))
        ];
        if (orderedCategories.length > 0) {
          setSelectedCategory(orderedCategories[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat produk');
      setToast({ open: true, message: err.message || 'Gagal memuat produk', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getCategoryIcon = (categoryName) => {
    if (categoryName.toLowerCase().includes('router')) return 'mdi:router-network';
    if (categoryName.toLowerCase().includes('mifi')) return 'mdi:wifi';
    if (categoryName.toLowerCase().includes('powerbank')) return 'mdi:power-plug';
    return 'mdi:star-outline';
  };

  const getProductIcon = (productName) => {
    if (productName.includes('1')) return 'mdi:numeric-1-box';
    if (productName.includes('2')) return 'mdi:numeric-2-box';
    if (productName.includes('3')) return 'mdi:numeric-3-box';
    if (productName.includes('4')) return 'mdi:numeric-4-box';
    if (productName.includes('5')) return 'mdi:numeric-5-box';
    if (productName.includes('6')) return 'mdi:numeric-6-box';
    if (productName.includes('7')) return 'mdi:numeric-7-box';
    return 'mdi:star-outline';
  };

  const calculateTotalReturn = (product) => {
    if (!product) return 0;
    return product.amount + (product.daily_profit * product.duration);
  };

  const getVIPConfig = (level) => {
    const configs = {
      0: { icon: 'mdi:shield-account', gradient: 'from-gray-500 to-slate-600', emoji: '🎯' },
      1: { icon: 'mdi:star-circle', gradient: 'from-yellow-700 to-orange-700', emoji: '⭐' },
      2: { icon: 'mdi:medal', gradient: 'from-gray-400 to-gray-600', emoji: '🥈' },
      3: { icon: 'mdi:trophy-variant', gradient: 'from-yellow-400 to-orange-500', emoji: '🏆' },
      4: { icon: 'mdi:diamond-stone', gradient: 'from-blue-400 to-purple-600', emoji: '💎' },
      5: { icon: 'mdi:crown-circle', gradient: 'from-cyan-400 to-blue-600', emoji: '👑' }
    };
    return configs[level] || configs[0];
  };

  const getVerificationStatus = () => {
    if (userData?.active) {
      return { text: 'Investor aktif', color: 'text-[#fe7d17]' };
    }
    return { text: 'Belum terverifikasi', color: 'text-red-500' };
  };

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    setTimeout(() => {
      setShowPromoPopup(true);
    }, 300);
  };

  const handleClosePromoPopup = () => {
    if (hidePopupChecked) {
      const tenMinutesFromNow = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem('popupHiddenUntil', tenMinutesFromNow.toString());
    }
    setShowPromoPopup(false);
    setHidePopupChecked(false);
  };

  const handleClaimReward = () => {
    if (applicationData?.link_group) {
      window.open(applicationData.link_group, '_blank');
    }
  };

  const vipConfig = getVIPConfig(userData?.level || 0);
  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Dashboard</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Dashboard`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <Image 
                src="/main_logo.svg"
                alt="XinXun Logo"
                width={150}
                height={150}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-gray-900">{applicationData?.name || 'XinXun'}</span>
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

      <div className="max-w-md mx-auto px-4 py-4">
        {/* User Info - Horizontal Layout */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:account" className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{userData?.name || 'Investor'}</h2>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}08` }}>
                <div className="flex items-center gap-2">
              <Icon icon="mdi:wallet" className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-xs text-gray-600">Saldo</span>
            </div>
            <span className="font-bold text-gray-900">{formatCurrency(userData?.balance || 0)}</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-500">Memuat produk...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-4">
            <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button 
              onClick={fetchProducts}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <div>
            {Object.keys(products).length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <Icon icon="mdi:package-variant" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tidak ada produk tersedia</p>
              </div>
            ) : (
              <>
                {/* Category Pills */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Kategori Produk</h3>
                  <div className="flex gap-2 justify-between">
                  {(() => {
                    const categories = Object.keys(products);
                      const preferred = ['Router', 'Mifi', 'Powerbank'];
                    const orderedCategories = [
                        ...preferred.filter((k) => categories.includes(k)),
                        ...categories.filter((k) => !preferred.includes(k)),
                    ];
                    return orderedCategories;
                    })().map((categoryName) => (
                    <button
                      key={categoryName}
                      onClick={() => {
                        setSelectedCategory(categoryName);
                        setSelectedProduct(products[categoryName][0] || null);
                      }}
                        className={`flex-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
                        selectedCategory === categoryName
                            ? 'text-white'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                        style={selectedCategory === categoryName ? { backgroundColor: primaryColor } : {}}
                    >
                        <Icon icon={getCategoryIcon(categoryName)} className="w-4 h-4" />
                      {categoryName}
                    </button>
                  ))}
                  </div>
                </div>

                {/* Product List */}
                {products[selectedCategory] && products[selectedCategory].length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {products[selectedCategory].map((product) => {
                      const isVipEnough = (userData?.level || 0) >= product.required_vip;
                      const canBuy = product.status === 'Active' && isVipEnough;

                      return (
                      <div 
                        key={product.id}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                <Icon icon={getProductIcon(product.name)} className="w-5 h-5" style={{ color: primaryColor }} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-500">{formatCurrency(product.amount)}</p>
                              </div>
                            </div>
                            {product.required_vip > 0 && (
                              <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg border border-yellow-200">
                                VIP {product.required_vip}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">Profit</p>
                              <p className="text-sm font-bold" style={{ color: primaryColor }}>
                                {formatCurrency(product.daily_profit)}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">Durasi</p>
                              <p className="text-sm font-bold text-gray-900">{product.duration} hari</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">Total</p>
                              <p className="text-sm font-bold text-gray-900">{formatCurrency(calculateTotalReturn(product))}</p>
                            </div>
                          </div>
                          
                          {product.purchase_limit > 0 && (
                            <div className="mb-3 flex items-center justify-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                              <Icon icon="mdi:information" className="w-3.5 h-3.5 text-orange-500" />
                              <span className="text-xs text-orange-700 font-medium">
                                Limit {product.purchase_limit}x pembelian
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setShowModal(true);
                            }}
                            disabled={!canBuy}
                            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: canBuy ? primaryColor : '#d1d5db' }}
                          >
                            {!isVipEnough ? `Butuh VIP ${product.required_vip}` : 'Beli Sekarang'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                    <Icon icon="mdi:package-variant" className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Tidak ada produk di kategori {selectedCategory}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Nav - Floating */}
          <BottomNavbar />

      {/* Welcome Popup - Simple White */}
      {showWelcomePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
              <button
                onClick={handleCloseWelcomePopup}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
              <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
              </button>
              
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <Icon icon="mdi:hand-wave" className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Selamat Datang, {userData?.name || 'Investor'}!
                    </h2>
              <p className="text-sm text-gray-600">Platform investasi AI terpercaya</p>
                </div>
                
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <Icon icon="mdi:shield-check" className="w-6 h-6 mx-auto mb-1" style={{ color: primaryColor }} />
                <p className="text-xs text-gray-600 font-medium">Aman</p>
                      </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <Icon icon="mdi:lightning-bolt" className="w-6 h-6 mx-auto mb-1" style={{ color: primaryColor }} />
                <p className="text-xs text-gray-600 font-medium">Cepat</p>
                    </div>
              <div className="text-center p-3 rounded-xl bg-gray-50">
                <Icon icon="mdi:trophy" className="w-6 h-6 mx-auto mb-1" style={{ color: primaryColor }} />
                <p className="text-xs text-gray-600 font-medium">Profit</p>
                    </div>
                  </div>
                  
            <p className="text-sm text-gray-600 text-center mb-6">
              Bergabunglah dengan komunitas kami untuk update dan dukungan 24/7
            </p>

            <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (applicationData?.link_group) {
                        window.open(applicationData.link_group, '_blank');
                      }
                    }}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
                  >
                    <Icon icon="mdi:telegram" className="w-5 h-5" />
                Gabung Telegram
                  </button>
                  <button
                    onClick={() => {
                      if (applicationData?.link_cs) {
                        window.open(applicationData.link_cs, '_blank');
                      }
                    }}
                className="w-full py-3 rounded-xl font-semibold border-2 flex items-center justify-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                <Icon icon="mdi:headset" className="w-5 h-5" />
                Hubungi CS
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Popup - Simple White */}
      {showPromoPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Promo Spesial</h3>
              <button
                onClick={handleClosePromoPopup}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
              </button>
                  </div>
                  
            <div className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon icon="mdi:youtube" className="w-6 h-6 text-red-500" />
                    </div>
                <span className="text-2xl font-bold">+</span>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Icon icon="logos:tiktok-icon" className="w-6 h-6 text-gray-900" />
                </div>
                </div>

              <h4 className="text-center font-bold text-gray-900 mb-2">Raih Hadiah Fantastis!</h4>
              <p className="text-sm text-gray-600 text-center mb-4">
                  Buat konten promosi XinXun di TikTok & YouTube, raih views, dan claim hadiahnya!
                </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-sm font-semibold text-gray-700">20K views</span>
                  <span className="font-bold text-blue-600">Rp 100K</span>
                    </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="text-sm font-semibold text-gray-700">50K views</span>
                  <span className="font-bold text-purple-600">Rp 300K</span>
                  </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-sm font-semibold text-gray-700">100K views</span>
                  <span className="font-bold text-green-600">Rp 700K</span>
                    </div>
                <div className="flex items-center justify-between p-3 rounded-lg border-2" style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}>
                  <span className="text-sm font-semibold text-gray-700">250K views</span>
                  <span className="font-bold" style={{ color: primaryColor }}>Rp 1JT</span>
                  </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                  <span className="text-sm font-semibold text-gray-700">500K views</span>
                  <span className="font-bold text-red-600">Rp 2JT</span>
                </div>
                </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon icon="mdi:information" className="w-5 h-5" style={{ color: primaryColor }} />
                  Syarat & Ketentuan
                </h5>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>Video original berkualitas HD, tanpa re-upload</span>
                    </li>
                  <li className="flex gap-2">
                    <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>Dilarang menggunakan BOT atau fake views</span>
                    </li>
                  <li className="flex gap-2">
                    <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>Wajib mencantumkan link referral di bio/deskripsi</span>
                    </li>
                  <li className="flex gap-2">
                    <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>Hadiah akan ditambahkan langsung ke saldo akun</span>
                    </li>
                  </ul>
                </div>

              <div className="space-y-2 mb-4">
                  <button
                    onClick={handleClaimReward}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                  >
                    <Icon icon="mdi:gift" className="w-5 h-5" />
                  Klaim Hadiah Sekarang
                  </button>
                  <button
                    onClick={handleClosePromoPopup}
                  className="w-full py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Nanti Saja
                  </button>
                </div>

              <label className="flex items-center justify-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidePopupChecked}
                    onChange={(e) => setHidePopupChecked(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: primaryColor }}
                  />
                <span className="text-xs text-gray-500">Jangan tampilkan selama 10 menit</span>
                  </label>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && selectedProduct && (
        <InvestmentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          product={selectedProduct}
          user={userData}
          onSuccess={(paymentData) => {
            setShowModal(false);
            setSelectedProduct(null);
            setToast({
              open: true,
              message: 'Investasi berhasil! Silakan lakukan pembayaran.',
              type: 'success',
            });
            router.push({
              pathname: '/payment',
              query: { data: encodeURIComponent(JSON.stringify(paymentData)) },
            });
          }}
        />
      )}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
