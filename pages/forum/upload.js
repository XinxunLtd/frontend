import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { checkForumStatus, submitForumTestimonial } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import { Icon } from '@iconify/react';
import Image from 'next/image';

export default function UploadWithdrawal() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusLoading, setStatusLoading] = useState(true);
    const [canUpload, setCanUpload] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [applicationData, setApplicationData] = useState(null);
    const primaryColor = '#fe7d17';

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (!token || !accessExpire) {
        router.push('/login');
        return;
        }
        // Check forum status on mount
        const checkStatus = async () => {
            setStatusLoading(true);
            setErrorMsg('');
            try {
                const res = await checkForumStatus();
                if (res?.data?.has_withdrawal) {
                    setCanUpload(true);
                    setStatusMsg('Anda dapat mengunggah testimoni penarikan karena ada penarikan dalam 3 hari terakhir.');
                } else {
                    setCanUpload(false);
                    setStatusMsg('Anda belum melakukan penarikan dalam 3 hari terakhir. Silakan lakukan penarikan terlebih dahulu untuk bisa mengunggah testimoni.');
                }
            } catch (err) {
                setErrorMsg('Gagal memeriksa status penarikan.');
            } finally {
                setStatusLoading(false);
            }
        };
        checkStatus();
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

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setErrorMsg('File harus JPG atau PNG.');
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg('Ukuran file maksimal 2MB.');
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }
            setErrorMsg('');
            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        // Extra validation: prevent submit if no image
        if (!selectedFile) {
            setErrorMsg('Pilih gambar terlebih dahulu.');
            return;
        }
        if (selectedFile === null || typeof selectedFile !== 'object') {
            setErrorMsg('Pilih gambar terlebih dahulu.');
            return;
        }
        if (comment.trim().length < 5 || comment.trim().length > 60) {
            setErrorMsg('Deskripsi minimal 5 dan maksimal 60 karakter.');
            return;
        }
        setIsSubmitting(true);
        setUploadProgress(0);
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 15;
                setUploadProgress(Math.min(progress, 95));
            }, 150);

            // Submit to API
            const res = await submitForumTestimonial({ image: selectedFile, description: comment });
            clearInterval(progressInterval);
            setUploadProgress(100);
            setIsSubmitting(false);
            if (res?.success) {
                setSuccessMsg(res?.message || 'Postingan terkirim, menunggu persetujuan.');
                setErrorMsg('');
                setTimeout(() => {
                    setSuccessMsg('');
                    router.push('/forum');
                }, 5000);
            } else {
                setErrorMsg(res?.message || 'Gagal mengunggah testimoni.');
                setSuccessMsg('');
            }
        } catch (err) {
            setIsSubmitting(false);
            setErrorMsg('Gagal mengunggah testimoni.');
            setSuccessMsg('');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Head>
                <title>{applicationData?.name || 'XinXun'} | Upload Testimoni</title>
                <meta
                    name="description"
                    content={`${applicationData?.name || 'XinXun'} Upload Testimoni`}
                />
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
              <Icon icon="mdi:upload" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Upload Testimoni</h1>
          </div>
        </div>
      </div>

            <div className="mx-auto w-full max-w-sm px-4 pt-4 pb-6">
                {/* Status Card */}
                {statusLoading ? (
                    <div className="mb-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600">Memeriksa status penarikan...</p>
                    </div>
                ) : (
                    <div
                        className={`mb-4 border rounded-lg px-4 py-4 ${
                            canUpload
                                ? 'bg-green-50 border-green-200'
                                : 'bg-amber-50 border-amber-200'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                canUpload ? 'bg-green-100' : 'bg-amber-100'
                            }`}>
                                <Icon
                                    icon={canUpload ? 'mdi:check-circle' : 'mdi:alert-circle'}
                                    className={`w-5 h-5 ${canUpload ? 'text-green-600' : 'text-amber-600'}`}
                                />
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${canUpload ? 'text-green-900' : 'text-amber-900'}`}>
                                    {canUpload ? 'Siap Upload!' : 'Belum Bisa Upload'}
                                </p>
                                <p className={`text-xs mt-0.5 ${canUpload ? 'text-green-700' : 'text-amber-700'}`}>
                                    {statusMsg}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reward Badge */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                    <Icon icon="mdi:gift" className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-900">Bonus Rp 2.000 - Rp 20.000</p>
                    <p className="text-[11px] text-orange-700">Per testimoni terverifikasi</p>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="mt-4 mb-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon icon="mdi:information-outline" className="w-5 h-5 text-orange-600" />
                        <h3 className="text-sm font-bold text-gray-900">Panduan Upload</h3>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-xs text-gray-700">
                            <Icon icon="mdi:check" className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Screenshot bukti penarikan yang sah & jelas</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-700">
                            <Icon icon="mdi:check" className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Deskripsi 5-60 karakter</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-700">
                            <Icon icon="mdi:check" className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Format JPG/PNG, maksimal 2MB</span>
                        </li>
                    </ul>
                </div>

                {/* Upload Form */}
                <div className="mb-4 bg-white border border-gray-100 rounded-lg px-4 py-4">
                    {errorMsg && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{errorMsg}</p>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
                            <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-green-700">{successMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Gambar Bukti Penarikan
                            </label>

                            {previewUrl ? (
                                <div className="relative">
                                    <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            unoptimized
                                            width={400}
                                            height={200}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                        }}
                                        disabled={isSubmitting}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
                                    >
                                        <Icon icon="mdi:close" className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={canUpload && !isSubmitting ? handleFileSelect : undefined}
                                    disabled={!canUpload || isSubmitting}
                                    className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                                        !canUpload || isSubmitting
                                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                            : 'bg-orange-50 border-orange-300 hover:bg-orange-100'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        canUpload && !isSubmitting ? 'bg-orange-100' : 'bg-gray-200'
                                    }`}>
                                        <Icon
                                            icon="mdi:image-plus"
                                            className={`w-6 h-6 ${canUpload && !isSubmitting ? 'text-orange-600' : 'text-gray-400'}`}
                                        />
                                    </div>
                                    <p className={`text-sm font-semibold ${canUpload && !isSubmitting ? 'text-gray-900' : 'text-gray-400'}`}>
                                        Pilih Gambar
                                    </p>
                                    <p className="text-xs text-gray-500">JPG/PNG, maks 2MB</p>
                                </button>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png"
                                className="hidden"
                                disabled={!canUpload || isSubmitting}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                minLength={5}
                                maxLength={60}
                                placeholder="Ceritakan pengalaman penarikan Anda..."
                                required
                                disabled={!canUpload || isSubmitting}
                                className="w-full min-h-[100px] px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">{comment.length}/60 karakter</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !canUpload || !selectedFile}
                            className="w-full py-3 rounded-lg text-white text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: isSubmitting || !canUpload || !selectedFile ? '#d1d5db' : primaryColor }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    Mengunggah...
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:send" className="w-5 h-5" />
                                    Submit Testimoni
                                </>
                            )}
                        </button>

                        {/* Progress Bar */}
                        {isSubmitting && (
                            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${uploadProgress}%`,
                                        backgroundColor: primaryColor,
                                    }}
                                />
                            </div>
                        )}
                    </form>
                </div>

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