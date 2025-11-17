// components/InvestmentModal.js
import React, { useState, useEffect } from 'react';
import { createInvestment } from '../utils/api';
import { useRouter } from 'next/router';
import { BANKS } from '../constants/products';
import { Icon } from '@iconify/react';

const PAYMENT_METHODS = [
  { value: 'QRIS', label: 'QRIS', icon: 'mdi:qrcode-scan' },
  { value: 'BANK', label: 'Bank Transfer', icon: 'mdi:bank' }
];

export default function InvestmentModal({ open, onClose, product, user, onSuccess }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open || !product) return null;

  const amount = product.amount;
  const dailyProfit = product.daily_profit;
  const duration = product.duration;
  const totalReturn = amount + (dailyProfit * duration);

  const isQRISDisabled = amount > 10000000;

  useEffect(() => {
    if (open && product) {
      const defaultMethod = isQRISDisabled ? 'BANK' : 'QRIS';
      setPaymentMethod(defaultMethod);
      if (BANKS && BANKS.length > 0) {
        setBank(BANKS[0].code);
      }
      setError('');
    }
  }, [open, product?.id, isQRISDisabled]);

  const category = product.category || {};
  const categoryName = category.name || 'Unknown';

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amt);

  const handlePaymentMethodClick = (methodValue) => {
    if (loading) return;
    if (methodValue === 'QRIS' && isQRISDisabled) return;
    setPaymentMethod(methodValue);
  };

  const handleConfirm = async () => {
    setError('');
    if (paymentMethod === 'BANK' && !bank) {
      setError('Pilih bank transfer.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        product_id: product.id,
        payment_method: paymentMethod,
        payment_channel: paymentMethod === 'BANK' ? bank : undefined,
      };
      const data = await createInvestment(payload);
      setLoading(false);
      if (data && data.data && data.data.order_id) {
        router.push(`/payment?order_id=${encodeURIComponent(data.data.order_id)}`);
      } else {
        setError('Gagal mendapatkan order ID pembayaran');
      }
    } catch (err) {
      setError(err.message || 'Gagal melakukan investasi');
      setLoading(false);
    }
  };

  const primaryColor = '#fe7d17';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl max-h-[90vh] overflow-hidden">
        {/* Header - Simple */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <Icon icon="mdi:shopping" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{product.name}</h2>
              <p className="text-xs text-gray-500">{categoryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Investment Summary - Compact Grid */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan Investasi</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Jumlah Investasi</span>
                <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Profit</p>
                  <p className="text-sm font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(dailyProfit * duration)}
                  </p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Durasi</p>
                  <p className="text-sm font-bold text-gray-900">{duration} hari</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(totalReturn)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                <span className="text-sm font-semibold text-gray-700">Total Kembali</span>
                <span className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(totalReturn)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Metode Pembayaran</h3>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isDisabled = method.value === 'QRIS' && isQRISDisabled;
                const isSelected = paymentMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handlePaymentMethodClick(method.value)}
                    disabled={loading || isDisabled}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#fe7d17] bg-[#fe7d17]/5'
                        : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      icon={method.icon}
                      className={`w-8 h-8 mx-auto mb-2 ${
                        isSelected
                          ? 'text-[#fe7d17]'
                          : isDisabled
                            ? 'text-gray-300'
                            : 'text-gray-500'
                      }`}
                    />
                    <p className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-[#fe7d17]'
                        : isDisabled
                          ? 'text-gray-400'
                          : 'text-gray-700'
                    }`}>
                      {method.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Bank Selection */}
            {paymentMethod === 'BANK' && BANKS && BANKS.length > 0 && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Pilih Bank</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-900 focus:border-[#fe7d17] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* QRIS Warning */}
            {isQRISDisabled && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <Icon icon="mdi:information" className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700">
                  <span className="font-semibold">Limit QRIS:</span> Transaksi di atas Rp 10.000.000 harus menggunakan Bank Transfer.
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold mb-1">Gagal memproses</p>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle" className="w-5 h-5" />
                  <span>Konfirmasi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
