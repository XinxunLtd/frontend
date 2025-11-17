// pages/payment.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getPaymentByOrderId } from '../utils/api';

export default function Payment() {
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [expired, setExpired] = useState(false);
  const [timer, setTimer] = useState('');
  const [copied, setCopied] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchPayment = async () => {
      if (router.query.order_id) {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await getPaymentByOrderId(router.query.order_id);
          if (res && res.data) {
            setPayment(res.data);
            startCountdown(res.data.expired_at);
            setErrorMsg('');
          } else if (res && res.message) {
            setErrorMsg(res.message);
            setPayment(null);
          } else {
            setErrorMsg('Data pembayaran tidak ditemukan.');
            setPayment(null);
          }
        } catch (e) {
          if (e?.response?.status === 404 && e?.response?.data?.message) {
            setErrorMsg(e.response.data.message);
          } else {
            setErrorMsg('Data pembayaran tidak ditemukan.');
          }
          setPayment(null);
        }
        setLoading(false);
      }
    };
    fetchPayment();

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
  }, [router.query.order_id]);

  const startCountdown = (expiredAt) => {
    const end = new Date(expiredAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimer('00:00:00');
        setExpired(true);
        clearInterval(interval);
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amt);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1800);
  };

  const handleDownloadQR = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qris.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      window.open(url, '_blank');
    }
  };

  const primaryColor = '#fe7d17';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Head>
          <title>{applicationData?.name || 'XinXun'} | Pembayaran</title>
          <meta name="description" content={`${applicationData?.name || 'XinXun'} Pembayaran`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center border border-gray-200">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
            <div className="w-6 h-6 border-3 border-gray-200 border-t-[#fe7d17] rounded-full animate-spin" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Memuat Pembayaran</h3>
          <p className="text-sm text-gray-500">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Head>
          <title>{applicationData?.name || 'XinXun'} | Pembayaran</title>
          <meta name="description" content={`${applicationData?.name || 'XinXun'} Pembayaran`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center border border-red-200">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Data Tidak Ditemukan</h3>
          <p className="text-sm text-gray-600 mb-6">
            {errorMsg || 'Data pembayaran tidak ditemukan.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 rounded-xl font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const amount = payment.amount || 0;
  const paymentMethod = payment.payment_method || '';
  const paymentChannel = payment.payment_channel || '';
  const paymentCode = payment.payment_code || '';
  const product = payment.product || '';
  const orderId = payment.order_id || '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentCode)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Pembayaran</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Pembayaran`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto w-full max-w-md">
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Pembayaran</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Timer Badge - Floating */}
        <div className="mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            expired ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
          }`}>
            <Icon
              icon={expired ? 'mdi:clock-alert' : 'mdi:timer-outline'}
              className={`w-4 h-4 ${expired ? 'text-red-500' : 'text-[#fe7d17]'}`}
            />
            <span className="text-xs font-medium text-gray-700">
              {expired ? 'Expired' : 'Sisa waktu'}
            </span>
            <span className={`font-mono text-sm font-bold ${
              expired ? 'text-red-600' : 'text-[#fe7d17]'
            }`}>
              {timer}
            </span>
          </div>
        </div>

        {/* Amount Card - Big & Clean */}
        <div className="mb-4 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500 mb-2">Total Pembayaran</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(amount)}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50">
              <Icon icon="mdi:package-variant" className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-sm font-medium text-gray-700">{product}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="mb-4 bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Metode Pembayaran</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
              <Icon
                icon={paymentMethod === 'QRIS' ? 'mdi:qrcode-scan' : 'mdi:bank'}
                className="w-4 h-4"
                style={{ color: primaryColor }}
              />
              <span className="text-sm font-semibold text-gray-900">
                {paymentMethod === 'QRIS' ? 'QRIS' : `${paymentChannel}`}
              </span>
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Order ID</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="flex-1 font-mono text-xs text-gray-900 break-all">{orderId}</span>
              <button
                onClick={() => handleCopy('orderId', orderId)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                  copied.orderId
                    ? 'bg-green-50 text-green-600'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon icon={copied.orderId ? 'mdi:check' : 'mdi:content-copy'} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Details - QRIS or Bank */}
        {paymentMethod === 'QRIS' ? (
          <div className="mb-4 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:qrcode-scan" className="w-5 h-5" style={{ color: primaryColor }} />
              Scan QR Code
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <img
                src={qrUrl}
                alt="QRIS"
                className="w-full aspect-square object-contain rounded-lg"
              />
            </div>

            <button
              onClick={() => handleDownloadQR(qrUrl)}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Icon icon="mdi:download" className="w-5 h-5" />
              Download QR Code
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Scan menggunakan aplikasi e-wallet atau mobile banking
            </p>
          </div>
        ) : (
          <div className="mb-4 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:bank-transfer" className="w-5 h-5" style={{ color: primaryColor }} />
              Transfer Bank
            </h3>

            <label className="text-xs font-medium text-gray-500 mb-2 block">
              Virtual Account {paymentChannel}
            </label>
            <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4">
              <span className="flex-1 font-mono text-base font-bold text-gray-900 break-all tracking-wide">
                {paymentCode}
              </span>
              <button
                onClick={() => handleCopy('va', paymentCode)}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  copied.va
                    ? 'bg-green-50 text-green-600'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon icon={copied.va ? 'mdi:check' : 'mdi:content-copy'} className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Transfer melalui ATM, mobile banking, atau internet banking
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => router.push('/history/investment')}
            className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:history" className="w-5 h-5" />
            Lihat Status Pembayaran
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
