import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import LiveChatWidget from '../components/LiveChat/LiveChatWidget';
import {
  requestForgotPasswordOTP,
  resendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword
} from '../utils/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [formData, setFormData] = useState({
    number: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const otpInputRef0 = useRef(null);
  const otpInputRef1 = useRef(null);
  const otpInputRef2 = useRef(null);
  const otpInputRef3 = useRef(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const primaryColor = '#fe7d17';

  useEffect(() => {
    const storedApplication = sessionStorage.getItem('application');
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

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');

    if (value.startsWith('+')) {
      value = value.slice(1);
    }

    value = value.replace(/[^0-9]/g, '');

    if (/^(62|0)8/.test(value)) {
      value = value.replace(/^(62|0)/, '');
    }

    if (!value.startsWith('8') && value.length > 0) {
      value = value.replace(/^62/, '');
    }

    if (value.length > 12) value = value.slice(0, 12);

    setFormData((prev) => ({ ...prev, number: value }));
    setNotification({ message: '', type: '' });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setNotification({ message: '', type: '' });
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);

    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Update formData.otp
    const otpValue = newDigits.join('');
    setFormData((prev) => ({ ...prev, otp: otpValue }));
    setNotification({ message: '', type: '' });

    // Auto focus to next input
    if (digit && index < 3) {
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      refs[index + 1]?.current?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);

    if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);

      const otpValue = newDigits.join('');
      setFormData((prev) => ({ ...prev, otp: otpValue }));

      // Focus on last filled input or first empty
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      const focusIndex = Math.min(pastedData.length, 3);
      refs[focusIndex]?.current?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      refs[index - 1]?.current?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!/^8\d{8,11}$/.test(formData.number)) {
      setNotification({ message: 'Nomor HP tidak valid', type: 'error' });
      return;
    }

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await requestForgotPasswordOTP(formData.number);

      if (result?.success) {
        setRequestId(result.data?.request_id || null);
        setNotification({
          message: result.message || 'Kode Verifikasi berhasil dikirim',
          type: 'success'
        });

        // Set countdown timer
        if (result.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
        }

        // Set resend countdown (default 60 seconds for first request)
        setResendCountdown(60);

        // Reset OTP digits
        setOtpDigits(['', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));

        setStep(2);
        // Auto focus first OTP input
        setTimeout(() => {
          otpInputRef0.current?.focus();
        }, 100);
      } else {
        setNotification({
          message: result?.message || 'Gagal mengirim kode verifikasi',
          type: 'error'
        });

        // Set countdown if retry_after_seconds is provided
        if (result?.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
        }
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0 || countdown > 0) return;

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await resendForgotPasswordOTP(formData.number);

      if (result?.success) {
        setRequestId(result.data?.request_id || null);
        setNotification({
          message: result.message || 'Kode Verifikasi berhasil dikirim ulang',
          type: 'success'
        });

        // Reset OTP digits
        setOtpDigits(['', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));

        // Auto focus first OTP input
        setTimeout(() => {
          otpInputRef0.current?.focus();
        }, 100);

        // Set countdown timer
        if (result.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
          setResendCountdown(result.data.retry_after_seconds);
        }
      } else {
        setNotification({
          message: result?.message || 'Gagal mengirim ulang kode verifikasi',
          type: 'error'
        });

        // Set countdown if retry_after_seconds is provided
        if (result?.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
          setResendCountdown(result.data.retry_after_seconds);
        }
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 4) {
      setNotification({ message: 'Kode Verifikasi harus 4 digit', type: 'error' });
      return;
    }

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await verifyForgotPasswordOTP(formData.otp, requestId);

      if (result?.success) {
        setResetToken(result.data?.token || null);
        setNotification({
          message: result.message || 'Kode Verifikasi benar',
          type: 'success'
        });
        // Reset OTP digits
        setOtpDigits(['', '', '', '']);
        setStep(3);
      } else {
        setNotification({
          message: result?.message || 'Kode Verifikasi tidak valid',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setNotification({ message: 'Password minimal 6 karakter', type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama', type: 'error' });
      return;
    }

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await resetPassword(formData.password, formData.confirmPassword, resetToken);

      if (result?.success) {
        setNotification({
          message: result.message || 'Password berhasil diubah',
          type: 'success'
        });

        // Redirect to login after 5 seconds
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } else {
        setNotification({
          message: result?.message || 'Gagal mengubah password',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Lupa Password</title>
        <meta name="description" content={`Reset password untuk akun ${applicationData?.name || 'XinXun'} Anda.`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex items-center justify-center mb-4">
              <div>
                <div className="w-full h-full flex items-center justify-center rounded-full bg-white">
                  <Image
                    src="/new_logo.png"
                    alt="XinXun Logo"
                    width={150}
                    height={150}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {step === 1 && 'Masukkan nomor HP untuk mengatur ulang password'}
              {step === 2 && 'Masukkan kode verifikasi yang dikirim ke nomor Anda'}
              {step === 3 && 'Buat password baru untuk akun Anda'}
            </p>
          </div>

          <div className="border rounded-3xl bg-white shadow-sm px-6 py-7">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  3
                </div>
              </div>
            </div>

            {notification.message && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
              >
                <Icon
                  icon={
                    notification.type === 'success'
                      ? 'mdi:check-circle'
                      : 'mdi:alert-circle'
                  }
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                />
                <span className="flex-1">{notification.message}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="number"
                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                  >
                    Nomor HP
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
                    <span className="mr-2 text-sm font-medium text-neutral-600">
                      +62
                    </span>
                    <input
                      type="tel"
                      id="number"
                      className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      placeholder="8xxxxxxxxxxx"
                      value={formData.number}
                      onChange={handleNumberChange}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || countdown > 0 || !/^8\d{8,11}$/.test(formData.number)}
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor:
                      isLoading || countdown > 0 || !/^8\d{8,11}$/.test(formData.number)
                        ? '#f1f1f1'
                        : primaryColor,
                    color:
                      isLoading || countdown > 0 || !/^8\d{8,11}$/.test(formData.number)
                        ? '#b0b0b0'
                        : '#ffffff',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mengirim...</span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                      <span>Tunggu {formatTime(countdown)}</span>
                    </>
                  ) : (
                    <span>Kirim Kode Verifikasi</span>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Kode Verifikasi
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={index === 0 ? otpInputRef0 : index === 1 ? otpInputRef1 : index === 2 ? otpInputRef2 : otpInputRef3}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`w-14 h-14 text-center text-2xl font-semibold rounded-xl border-2 bg-white text-neutral-900 outline-none transition-all ${otpDigits[index]
                          ? 'border-[#fe7d17] ring-2 ring-[#fe7d17]'
                          : 'border-neutral-200 focus:border-[#fe7d17] focus:ring-2 focus:ring-[#fe7d17]'
                          }`}
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onPaste={handleOtpPaste}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        maxLength={1}
                        required
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-center text-neutral-500">
                    Kode Verifikasi telah dikirim ke +62{formData.number}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCountdown > 0 || countdown > 0}
                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-50"
                  >
                    {resendCountdown > 0 || countdown > 0 ? (
                      <>
                        <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                        <span>{formatTime(resendCountdown || countdown)}</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:refresh" className="w-4 h-4" />
                        <span>Kirim Ulang</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !formData.otp || formData.otp.length !== 4}
                    className="flex-1 h-11 items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      backgroundColor:
                        isLoading || !formData.otp || formData.otp.length !== 4
                          ? '#f1f1f1'
                          : primaryColor,
                      color:
                        isLoading || !formData.otp || formData.otp.length !== 4
                          ? '#b0b0b0'
                          : '#ffffff',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <span>Verifikasi</span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormData(prev => ({ ...prev, otp: '' }));
                    setOtpDigits(['', '', '', '']);
                    setNotification({ message: '', type: '' });
                  }}
                  className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Ubah nomor HP
                </button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                  >
                    Password Baru
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      placeholder="Masukkan password baru"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-neutral-400 hover:text-neutral-700"
                    >
                      <Icon
                        icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Minimal 6 karakter
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-neutral-800"
                  >
                    Konfirmasi Password
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#fe7d17]">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="h-9 flex-1 border-none bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      placeholder="Konfirmasi password baru"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2 text-neutral-400 hover:text-neutral-700"
                    >
                      <Icon
                        icon={showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !formData.password ||
                    formData.password.length < 6 ||
                    formData.password !== formData.confirmPassword
                  }
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor:
                      isLoading ||
                        !formData.password ||
                        formData.password.length < 6 ||
                        formData.password !== formData.confirmPassword
                        ? '#f1f1f1'
                        : primaryColor,
                    color:
                      isLoading ||
                        !formData.password ||
                        formData.password.length < 6 ||
                        formData.password !== formData.confirmPassword
                        ? '#b0b0b0'
                        : '#ffffff',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mengubah password...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:lock-reset" className="w-5 h-5" />
                      <span>Ubah Password</span>
                    </>
                  )}
                </button>

                {notification.type === 'success' && (
                  <p className="text-center text-xs text-neutral-500 mt-2">
                    Redirect ke halaman login dalam 5 detik...
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="mt-5 text-center text-sm">
            <p className="text-neutral-700">
              Ingat password? {' '}
              <Link href="/login" className="font-semibold text-[#fe7d17]">
                Masuk
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400">
            © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
          </div>
        </div>
      </div>
      <LiveChatWidget />
    </>
  );
}
