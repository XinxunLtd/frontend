import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { updateUserProfile, deleteUserProfile } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Image from 'next/image';
import ProfileImage from '../../components/ProfileImage';

export default function UpdateProfile() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const primaryColor = '#fe7d17';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        setName(parsed.name || '');
        setProfile(parsed.profile || null);
      } catch (e) {
        setUserData({ name: '', profile: null });
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
  }, [router]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrorMsg('File harus JPG atau PNG.');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5MB.');
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
    
    if (!name.trim()) {
      setErrorMsg('Nama tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ 
        name: name.trim(), 
        profile: selectedFile 
      });
      
      if (res?.success) {
        // Update localStorage
        const updatedUser = {
          ...userData,
          name: res.data.name,
          profile: res.data.profile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setProfile(res.data.profile);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSuccessMsg(res?.message || 'Profile berhasil diperbarui.');
        
        // Dispatch event to update other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-profile-updated'));
        }
      } else {
        setErrorMsg(res?.message || 'Gagal memperbarui profile.');
      }
    } catch (err) {
      setErrorMsg('Gagal memperbarui profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    setIsDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await deleteUserProfile();
      
      if (res?.success) {
        // Update localStorage
        const updatedUser = {
          ...userData,
          profile: null
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setProfile(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSuccessMsg(res?.message || 'Foto profile berhasil dihapus.');
        
        // Dispatch event to update other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-profile-updated'));
        }
      } else {
        setErrorMsg(res?.message || 'Gagal menghapus foto profile.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghapus foto profile.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Update Profile</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Update Profile`} />
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
              <Icon icon="mdi:account-edit" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Update Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Current Profile Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Foto Profile Saat Ini</h2>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative group"
            >
              {previewUrl ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-orange-200 ring-offset-2">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    unoptimized
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Icon icon="mdi:camera" className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <ProfileImage 
                    profile={profile}
                    className="w-24 h-24"
                    iconClassName="w-12 h-12"
                    primaryColor={primaryColor}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Icon icon={profile ? "mdi:camera" : "mdi:image-plus"} className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="w-full py-3 rounded-lg text-white text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: isSubmitting || isDeleting ? '#d1d5db' : primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {profile || previewUrl ? 'Ganti Foto Profile' : 'Tambahkan Foto Profile'}
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <Icon icon="mdi:close" className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  handleFileSelect();
                  setShowProfileModal(false);
                }}
                className="w-full py-3 px-4 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:image-plus" className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="font-semibold" style={{ color: primaryColor }}>
                  {profile || previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
                </span>
              </button>

              {(profile || previewUrl) && (
                <button
                  onClick={() => {
                    if (previewUrl) {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                      setShowProfileModal(false);
                    } else {
                      setShowProfileModal(false);
                      setShowDeleteConfirm(true);
                    }
                  }}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600/50 border-t-red-600 rounded-full animate-spin" />
                      <span className="text-red-600 font-semibold">Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:delete" className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold">Hapus Foto</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-semibold"
              >
                Batal
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Format: JPG/PNG, maksimal 5MB
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Hapus Foto Profile?
            </h3>
            
            <p className="text-sm text-gray-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus foto profile? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-semibold disabled:opacity-50"
              >
                Batal
              </button>
              
              <button
                onClick={async () => {
                  setShowDeleteConfirm(false);
                  await handleDeleteProfile();
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:delete" className="w-5 h-5" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        disabled={isSubmitting}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-sm">
          <BottomNavbar />
        </div>
      </div>
    </div>
  );
}

