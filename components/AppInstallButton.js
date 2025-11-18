import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp, isIOS, isAndroid, isDesktop, isAppInstalled } from '../utils/mobileAppDetection';
import CustomAlert from './CustomAlert';

/**
 * AppInstallButton Component
 * Smart app installation button that detects if app is installed
 * Only shows for browser users, hidden for mobile app users
 */
export default function AppInstallButton({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);
  const [deviceType, setDeviceType] = useState({ isIOS: false, isAndroid: false, isDesktop: false });
  const [isAppInstalledState, setIsAppInstalledState] = useState(false);
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsInMobileApp(isMobileApp());
    setDeviceType({
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isDesktop: isDesktop()
    });

    // Check if app is installed
    const checkAppInstallation = async () => {
      try {
        const installed = await isAppInstalled();
        setIsAppInstalledState(installed);
      } catch (error) {
        console.log('Error checking app installation:', error);
        setIsAppInstalledState(false);
      } finally {
        setIsCheckingInstallation(false);
      }
    };

    checkAppInstallation();
  }, []);

  const handleAppAction = () => {
    // Jika sudah terinstall, buka aplikasi
    if (isAppInstalledState) {
      openApp();
      return;
    }

    // Jika belum terinstall, install aplikasi
    handleInstallApp();
  };

  const openApp = () => {
    if (deviceType.isAndroid) {
      // Android TWA: Gunakan fixed package name untuk membuka aplikasi
      // Package name untuk TWA XinXun
      const packageName = 'us.xinxun.app';

      // Intent untuk membuka aplikasi jika terinstall
      const intent = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=${packageName};end`;

      try {
        // Coba buka aplikasi dengan intent
        window.location.href = intent;
      } catch (error) {
        console.log('Error opening app:', error);
        // Jika gagal, tampilkan pesan
        setAlertConfig({
          title: 'Tidak Dapat Membuka Aplikasi',
          message: 'Tidak dapat membuka aplikasi. Pastikan aplikasi sudah terinstall dengan benar.',
          type: 'error',
          confirmText: 'OK'
        });
        setShowAlert(true);
      }
    } else if (deviceType.isIOS) {
      // iOS: Gunakan custom URL scheme atau fallback ke PWA
      const customScheme = `xinxun://${window.location.pathname}`;

      try {
        // Try custom scheme first
        window.location.href = customScheme;

        // Fallback setelah timeout
        setTimeout(() => {
          // Jika tidak bisa buka custom scheme, tampilkan guide
          if (!document.hidden) {
            showIOSInstallGuide();
          }
        }, 1500);
      } catch (error) {
        console.log('Error opening app:', error);
        showIOSInstallGuide();
      }
    }
  };

  const handleInstallApp = () => {
    // Jika Android dan ada link_app, download APK langsung (TWA)
    if (deviceType.isAndroid && applicationData?.link_app) {
      // Download APK langsung
      window.open(applicationData.link_app, '_blank');
      return;
    }

    // Jika iOS, tampilkan panduan PWA
    if (deviceType.isIOS) {
      showIOSInstallGuide();
      return;
    }

    // Jika desktop, tampilkan alert khusus
    if (deviceType.isDesktop) {
      showDesktopAlert();
      return;
    }

    // Jika tidak ada link_app, tampilkan pesan
    showNoLinkAlert();
  };

  const showIOSInstallGuide = () => {
    setAlertConfig({
      title: 'Install Aplikasi pada Perangkat iOS',
      message: 'Untuk menginstall aplikasi di iPhone/iPad:\n\n1. Tap tombol Share (kotak dengan panah) di bawah\n2. Scroll dan pilih "Add to Home Screen"\n3. Tap "Add"\n4. Icon aplikasi akan muncul di home screen Anda!',
      type: 'info',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showDesktopAlert = () => {
    setAlertConfig({
      title: 'Install Hanya untuk Mobile',
      message: 'Aplikasi hanya tersedia untuk perangkat mobile (Android & iOS).\n\nUntuk Android: Download APK langsung dari link yang tersedia\nUntuk iOS: Gunakan "Add to Home Screen" di Safari',
      type: 'warning',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showNoLinkAlert = () => {
    setAlertConfig({
      title: 'Link Download Belum Tersedia',
      message: 'Link download aplikasi belum tersedia. Silakan hubungi layanan bantuan untuk informasi lebih lanjut.',
      type: 'error',
      confirmText: 'OK'
    });
    setShowAlert(true);
  };

  // Jangan tampilkan jika di aplikasi mobile
  if (isInMobileApp) {
    return null;
  }

  // Tentukan icon dan text berdasarkan status
  const getButtonConfig = () => {
    if (isCheckingInstallation) {
      return {
        icon: 'mdi:loading',
        text: 'Checking...',
        subtitle: 'Memeriksa instalasi',
        isLoading: true
      };
    }

    if (isAppInstalledState) {
      return {
        icon: 'mdi:open-in-app',
        text: 'BUKA APLIKASI',
        subtitle: 'Lanjutkan di aplikasi XinXun',
        isLoading: false
      };
    }

    if (deviceType.isIOS) {
      return {
        icon: 'mdi:apple',
        text: 'INSTALL APLIKASI',
        subtitle: 'Add to Home Screen',
        isLoading: false
      };
    } else if (deviceType.isAndroid) {
      return {
        icon: 'mdi:android',
        text: 'DOWNLOAD APK',
        subtitle: 'Download Langsung',
        isLoading: false
      };
    } else {
      return {
        icon: 'mdi:cellphone-download',
        text: 'INSTALL APLIKASI',
        subtitle: 'Khusus Mobile',
        isLoading: false
      };
    }
  };

  const buttonConfig = getButtonConfig();

  const primaryColor = '#fe7d17';

  return (
    <>
      <div className={`${className}`}>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div
            className="px-4 py-3 border-b border-gray-100"
            style={{ backgroundColor: isAppInstalledState ? '#f0fdf4' : '#fff7ed' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: isAppInstalledState ? '#dcfce7' : primaryColor,
                }}
              >
                <Icon
                  icon={isAppInstalledState ? 'mdi:check-circle' : (deviceType.isAndroid ? 'mdi:android' : deviceType.isIOS ? 'mdi:apple' : 'mdi:cellphone-arrow-down')}
                  className={`w-7 h-7 ${buttonConfig.isLoading ? 'animate-spin' : ''}`}
                  style={{ color: isAppInstalledState ? '#16a34a' : '#fff' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">
                  {applicationData?.name || 'XinXun'} Mobile App
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isAppInstalledState
                    ? 'Aplikasi Terinstall'
                    : deviceType.isAndroid
                      ? 'Download APK Langsung'
                      : deviceType.isIOS
                        ? 'Add to Home Screen'
                        : 'Untuk perangkat mobile'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Status Message */}
            {isCheckingInstallation ? (
              <div className="flex items-center justify-center gap-2 py-3 mb-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-600">Memeriksa instalasi...</p>
              </div>
            ) : (
              <p className="text-sm text-gray-700 text-center mb-4 leading-relaxed">
                {isAppInstalledState
                  ? '✅ Aplikasi sudah terinstall di perangkat Anda. Klik tombol di bawah untuk membuka aplikasi.'
                  : deviceType.isIOS
                    ? '📱 Install aplikasi untuk pengalaman lebih cepat dan kemudahan akses.'
                    : deviceType.isAndroid
                      ? '📲 Download aplikasi APK langsung untuk pengalaman aplikasi native.'
                      : '💻 Aplikasi mobile tersedia untuk perangkat Android & iOS.'
                }
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={handleAppAction}
              disabled={isCheckingInstallation}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                isCheckingInstallation ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-white shadow-sm hover:shadow-md'
              }`}
              style={!isCheckingInstallation ? {
                backgroundColor: isAppInstalledState ? '#16a34a' : primaryColor,
              } : {}}
            >
              <Icon
                icon={isCheckingInstallation ? 'mdi:loading' : (isAppInstalledState ? 'mdi:open-in-app' : buttonConfig.icon)}
                className={`w-5 h-5 ${isCheckingInstallation ? 'animate-spin' : ''}`}
              />
              <span>
                {isCheckingInstallation
                  ? 'Checking...'
                  : isAppInstalledState
                    ? 'Buka Aplikasi'
                    : deviceType.isAndroid
                      ? 'Download APK'
                      : deviceType.isIOS
                        ? 'Panduan Install'
                        : 'Install Aplikasi'
                }
              </span>
            </button>

            {/* Additional Info */}
            {!isCheckingInstallation && (
              <div className="mt-3">
                {deviceType.isAndroid && !isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 px-3">
                    <Icon icon="mdi:shield-check-outline" className="w-4 h-4" />
                    <span>Aplikasi resmi & terverifikasi</span>
                  </div>
                )}
                {deviceType.isIOS && !isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg py-2 px-3">
                    <Icon icon="mdi:information-outline" className="w-4 h-4" />
                    <span>Gunakan Safari untuk install</span>
                  </div>
                )}
                {isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg py-2 px-3">
                    <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
                    <span>Ready to use</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        {...alertConfig}
      />
    </>
  );
}