// pages/spin-wheel.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSpinPrizeList, spinWheel, spinV2 } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function SpinWheel() {
  const router = useRouter();
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    balance: 0,
    name: '',
    number: '',
    reff_code: '',
    spin_ticket: 0,
    total_invest: 0,
    total_withdraw: 0
  });
  const wheelRef = useRef(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [pointerActive, setPointerActive] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  const prizeColors = [
    '#fe7d17', '#f59e0b', '#fb923c', '#f97316',
    '#ea580c', '#dc2626', '#ef4444', '#f87171'
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchSpinData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
        const res = await getSpinPrizeList();
        if (res && res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((prize) => prize.status === 'Active');
          const totalChance = filtered.reduce((sum, prize) => sum + (typeof prize.chance === 'number' ? prize.chance : 0), 0);
          const processedPrizes = filtered.map((prize, index) => ({
            ...prize,
            color: prizeColors[index % prizeColors.length],
            textColor: '#FFFFFF',
            name: prize.amount >= 1000 ? `Rp ${formatCurrency(prize.amount)}` : `${prize.amount} Poin`,
            chancePercent: totalChance > 0 ? ((prize.chance / totalChance) * 100) : 0
          }));
          setPrizes(processedPrizes);
        } else {
          setError('Gagal memuat hadiah spin');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching spin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpinData();
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

  const calculateRotation = (prizeIndex) => {
    if (!prizes || prizes.length === 0) return 0;
    const segmentAngle = 360 / prizes.length;
    const targetCenter = (prizeIndex + 0.5) * segmentAngle;
    const desiredFinal = (270 - targetCenter + 360) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;
    const finalRotation = fullSpins + desiredFinal;
    return finalRotation;
  };

  const handleSpin = async () => {
    if (userData.spin_ticket < 1) {
      setError('Tidak memiliki tiket spin yang cukup');
      return;
    }

    if (prizes.length === 0) {
      setError('Data hadiah belum dimuat');
      return;
    }

    setIsSpinning(true);
    setError(null);
    setResult(null);

    try {
      const previousRotation = currentRotation;
      const response = await spinV2();

      if (!response || !response.success) {
        setError(response?.message || 'Spin gagal');
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 600ms ease-out';
          wheelRef.current.style.transform = `rotate(${previousRotation}deg)`;
        }
        setCurrentRotation(previousRotation);
        setIsSpinning(false);
        return;
      }

      const serverPrize = response.data && response.data.spin_result ? response.data.spin_result : null;
      let serverIndex = -1;
      if (serverPrize) {
        serverIndex = prizes.findIndex(p => (p.code && serverPrize.code && p.code === serverPrize.code) || (Number(p.amount) === Number(serverPrize.amount)));
      }
      if (serverIndex === -1) serverIndex = 0;

      const finalRotation = calculateRotation(serverIndex);
      const baseFull = Math.floor(currentRotation / 360) * 360;
      let targetRotation = baseFull + finalRotation;
      if (targetRotation <= currentRotation) targetRotation += 360;
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2,0.7,0.3,1)';
        wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
      }
      await new Promise(resolve => setTimeout(resolve, 4200));
      setCurrentRotation(targetRotation);

      setPointerActive(true);
      setResult({
        prize: {
          amount: response.data.spin_result.amount,
          name: response.data.spin_result.amount >= 1000 ? `Rp ${formatCurrency(response.data.spin_result.amount)}` : `${response.data.spin_result.amount} Poin`
        },
        message: response.message,
        previousBalance: response.data.balance_info.previous_balance,
        currentBalance: response.data.balance_info.current_balance,
        prizeAmount: response.data.balance_info.prize_amount
      });
      setTimeout(() => setPointerActive(false), 1800);

      const updatedUserData = {
        ...userData,
        balance: response.data.balance_info.current_balance,
        spin_ticket: userData.spin_ticket - 1
      };
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));

    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
      }
    } finally {
      setIsSpinning(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const createWheelSegments = () => {
    if (prizes.length === 0) return null;

    const segmentAngle = 360 / prizes.length;
    const radius = 140;
    const centerX = 140;
    const centerY = 140;

    return prizes.map((prize, index) => {
      const startAngleRad = (index * segmentAngle) * (Math.PI / 180);
      const endAngleRad = ((index + 1) * segmentAngle) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const textAngleRad = (startAngleRad + endAngleRad) / 2;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);

      const textAngleDeg = (textAngleRad * (180 / Math.PI)) + 90;
      return (
        <g key={index}>
          <path d={pathData} fill={prize.color} stroke="#fff" strokeWidth="3" />
          <text
            x={textX}
            y={textY}
            fill={prize.textColor}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${textAngleDeg}, ${textX}, ${textY})`}
          >
            {prize.name}
          </text>
        </g>
      );
    });
  };

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Spin Wheel</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Spin Wheel`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto p-4">
        {/* Stats Bar - Horizontal Split */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <Icon icon="mdi:wallet" className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className="font-bold text-gray-900">Rp {formatCurrency(userData.balance)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border-2 text-center" style={{ borderColor: `${primaryColor}60` }}>
            <Icon icon="mdi:ticket" className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
            <p className="text-xs text-gray-500 mb-1">Tiket Spin</p>
            <p className="font-bold" style={{ color: primaryColor }}>{userData.spin_ticket}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Wheel Container */}
        <div className="mb-6 bg-white rounded-3xl p-6 border border-gray-200">
          <div className="relative flex justify-center">
            <div className="relative w-80 h-80">
              {loading ? (
                <div className="absolute inset-0 rounded-full bg-gray-50 border-2 border-gray-200 grid place-items-center">
                  <div className="w-10 h-10 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin" />
                </div>
              ) : (
                <svg
                  ref={wheelRef}
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 280 280"
                  style={{
                    transform: `rotate(${currentRotation}deg)`,
                    transition: 'transform 4s cubic-bezier(0.2, 0.7, 0.3, 1)',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                  }}
                >
                  {createWheelSegments()}
                </svg>
              )}

              {/* Center Button */}
              <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center border-4 border-white" style={{ backgroundColor: primaryColor }}>
                <Icon icon="mdi:star" className="w-8 h-8 text-white" />
              </div>

              {/* Pointer */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className={`w-0 h-0 border-l-[18px] border-r-[18px] border-t-[28px] border-l-transparent border-r-transparent drop-shadow-lg transition-all duration-300 ${
                  pointerActive ? 'border-t-green-500 scale-125' : 'border-t-[#fe7d17]'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Spin Button Inside Card */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || userData.spin_ticket < 1}
            className="w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: (isSpinning || userData.spin_ticket < 1) ? '#d1d5db' : primaryColor
            }}
          >
            {isSpinning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memutar...
              </>
            ) : (
              <>
                <Icon icon="mdi:play-circle" className="w-6 h-6" />
                {userData.spin_ticket < 1 ? 'Tiket Habis' : 'Putar Sekarang'}
              </>
            )}
          </button>
        </div>

        {/* How to Get Tickets */}
        <div className="mb-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Icon icon="mdi:information" className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1 text-sm">Cara Dapat Tiket Spin</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Lakukan investasi dan mengundang teman untuk mendapatkan tiket spin gratis dan kesempatan memenangkan hadiah!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setResult(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
              <Icon icon="mdi:trophy" className="w-10 h-10" style={{ color: primaryColor }} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">Selamat!</h2>
            <p className="text-sm text-gray-600 mb-6">Anda memenangkan</p>

            <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: `${primaryColor}10` }}>
              <p className="text-3xl font-black mb-2" style={{ color: primaryColor }}>
                {result.prize.name}
              </p>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Saldo Sebelum</span>
                <span className="font-semibold text-gray-900">Rp {formatCurrency(result.previousBalance)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Hadiah</span>
                <span className="font-semibold" style={{ color: primaryColor }}>+Rp {formatCurrency(result.prizeAmount)}</span>
              </div>
              <div className="h-px bg-gray-300 my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Saldo Sekarang</span>
                <span className="text-lg font-bold text-gray-900">Rp {formatCurrency(result.currentBalance)}</span>
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNavbar />
    </div>
  );
}
