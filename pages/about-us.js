// pages/about.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

export default function About() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);

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
  }, []);

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Tentang Kami</title>
        <meta name="description" content={`Tentang ${applicationData?.name || 'XinXun'}`} />
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
              <Icon icon="mdi:information-outline" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Tentang Kami</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6 text-center bg-white rounded-2xl p-6 border border-gray-200">
          <div className="w-40 h-auto relative mx-auto mb-3">
            <Image
              src="/main_logo.png"
              alt="Logo"
              width={160}
              height={50}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{applicationData?.name || 'XinXun'}</h2>
          <p className="text-gray-600 text-sm">#1 Investasi Properti di Indonesia</p>
        </div>

        {/* About Content */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
              <Icon icon="mdi:earth" className="w-5 h-5" style={{ color: primaryColor }} />
              Latar Belakang {applicationData?.name || 'XinXun'}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {applicationData?.name || 'XinXun'} adalah platform investasi yang berpusat di Kota Dongguan, Tiongkok. Didirikan oleh {applicationData?.company || 'XinXun, Ltd'} dengan visi dan misi menciptakan akses investasi properti premium bagi semua kalangan.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Platform ini lahir untuk menghapus hambatan tradisional dalam kepemilikan properti, sehingga investor lokal dapat berpartisipasi dengan modal yang lebih terjangkau namun tetap mendapatkan potensi keuntungan yang signifikan.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
              <Icon icon="mdi:target" className="w-5 h-5 text-blue-600" />
              Tujuan Pendirian
            </h3>
            <ul className="space-y-3">
              {[
                { title: "Memperluas Akses Investasi", text: "Memberikan kesempatan bagi investor di Indonesia untuk memiliki bagian dari properti strategis" },
                { title: "Meningkatkan Likuiditas", text: "Proses investasi yang cepat dan fleksibel, memungkinkan keluar-masuk investasi dengan mudah" },
                { title: "Transparansi & Efisiensi", text: "Laporan kinerja berkala untuk memantau perkembangan aset secara jelas" },
                { title: "Keamanan & Kepatuhan", text: "Mematuhi regulasi investasi internasional dan menerapkan sistem keamanan yang ketat" }
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon icon="mdi:check" className="text-green-600 w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                    <p className="text-gray-600 text-xs leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
              <Icon icon="mdi:diamond-stone" className="w-5 h-5" style={{ color: primaryColor }} />
              Nilai Utama
            </h3>
            <ul className="space-y-2">
              {[
                { icon: "mdi:earth", title: "Akses Global", text: "Terbuka untuk investor dari berbagai negara" },
                { icon: "mdi:office-building", title: "Kualitas Aset Premium", text: "Fokus pada properti bernilai tinggi dengan prospek pertumbuhan" },
                { icon: "mdi:chart-bar", title: "Manajemen Profesional", text: "Dikelola oleh tim berpengalaman di bidang investasi digital dan keuangan" },
                { icon: "mdi:handshake", title: "Inklusif", text: "Membuka peluang investasi bagi siapa saja, tanpa batasan latar belakang" }
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Icon icon={item.icon} className="text-blue-600 w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                    <p className="text-gray-600 text-xs">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
              <Icon icon="mdi:lightbulb-on-outline" className="w-5 h-5 text-yellow-500" />
              Kesimpulan
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {applicationData?.name || 'XinXun'} hadir untuk menjadi penghubung antara pasar properti kelas atas dan investor lokal. Dengan pengelolaan yang profesional, transparansi penuh, serta komitmen pada keamanan, kami menciptakan peluang investasi yang aman, menguntungkan, dan dapat diakses oleh semua kalangan.
            </p>
          </div>
        </div>

        {/* Legal Certificates Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Sertifikat Legal</h2>

          <div className="space-y-4">
            {/* Certificate of Incorporation */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="mdi:government" className="w-5 h-5 text-blue-600" />
                <h3 className="text-blue-900 font-semibold text-sm">Sertifikat Konformitas</h3>
              </div>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3 border border-blue-300 bg-white">
                <Image
                  src="/certificate_of_conformity.jpg"
                  alt="Certificate of Conformity"
                  fill
                  className="object-contain p-2"
                />
              </div>

              <div className="text-center">
                <p className="text-gray-900 font-bold text-sm">{applicationData?.company || 'XinXun, Ltd'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-400 py-6">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
