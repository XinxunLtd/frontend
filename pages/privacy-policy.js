// pages/privacy-policy.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';

export default function PrivacyPolicy() {
  const [applicationData, setApplicationData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApplication = localStorage.getItem('application');
      if (storedApplication) {
        try {
          setApplicationData(JSON.parse(storedApplication));
        } catch (error) {
          console.error('Error parsing application data:', error);
        }
      }
    }
  }, []);

  const primaryColor = '#fe7d17';

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Kebijakan Privasi</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Kebijakan Privasi`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
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
              <Icon icon="mdi:shield-check-outline" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Kebijakan Privasi</h1>
          </div>
        </div>
      </div>

        {/* Header */}
        <div className="pt-6 pb-4 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <Image
                  src="/main_logo.png"
                  alt="XinXun Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Kebijakan Privasi</h1>
              <p className="text-gray-600 text-sm">Terakhir diperbarui: 10 November 2025</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="space-y-6 text-sm leading-relaxed">

                {/* Introduction */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:shield-check" className="w-5 h-5" style={{ color: primaryColor }} />
                    Pengantar
                  </h2>
                  <p className="text-gray-700 mb-3">
                    Kebijakan Privasi ini menjelaskan kebijakan dan prosedur Kami dalam mengumpulkan, menggunakan, dan mengungkapkan informasi Anda ketika Anda menggunakan Layanan dan memberitahu Anda tentang hak privasi Anda dan bagaimana hukum melindungi Anda.
                  </p>
                  <p className="text-gray-700">
                    Kami menggunakan Data Pribadi Anda untuk menyediakan dan meningkatkan Layanan. Dengan menggunakan Layanan, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini.
                  </p>
                </div>

                {/* Definitions */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:book-open-variant" className="w-5 h-5" style={{ color: primaryColor }} />
                    Interpretasi dan Definisi
                  </h2>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">Definisi</h3>
                  <div className="space-y-2 text-gray-700 bg-gray-50 p-4 rounded-lg">
                    <p><strong className="text-gray-900">Akun</strong> berarti akun unik yang dibuat oleh Anda untuk mengakses Layanan kami atau bagian dari Layanan kami.</p>
                    <p><strong className="text-gray-900">Afiliasi</strong> berarti entitas yang mengontrol, dikontrol oleh, atau berada di bawah kontrol bersama dengan pihak, di mana "kontrol" berarti kepemilikan 50% atau lebih dari saham, kepentingan ekuitas atau sekuritas lain yang berhak memberikan suara untuk pemilihan direktur atau otoritas pengelola lainnya.</p>
                    <p><strong className="text-gray-900">Aplikasi</strong> mengacu pada XinXun, program perangkat lunak yang disediakan oleh Perusahaan.</p>
                    <p><strong className="text-gray-900">Perusahaan</strong> (disebut sebagai "Perusahaan" atau "Kami" dalam Perjanjian ini) mengacu pada XinXun, Ltd, Second Floor, Building C, Golden Sword Industrial Park, 12 Longjiang Road, Xiekeng Village, Qingxy Town, Dongguan City, Guangdong City, Tingkok.</p>
                    <p><strong className="text-gray-900">Cookies</strong> adalah file kecil yang ditempatkan di komputer, perangkat seluler atau perangkat lain oleh situs web, yang berisi detail riwayat penelusuran Anda di situs web tersebut di antara banyak kegunaannya.</p>
                    <p><strong className="text-gray-900">Negara</strong> mengacu pada: Kota Dongguan, Tiongkok</p>
                    <p><strong className="text-gray-900">Perangkat</strong> berarti perangkat apa pun yang dapat mengakses Layanan seperti komputer, telepon seluler atau tablet digital.</p>
                    <p><strong className="text-gray-900">Data Pribadi</strong> adalah informasi apa pun yang berkaitan dengan individu yang teridentifikasi atau dapat diidentifikasi.</p>
                    <p><strong className="text-gray-900">Layanan</strong> mengacu pada Aplikasi atau Situs Web atau keduanya.</p>
                    <p><strong className="text-gray-900">Penyedia Layanan</strong> berarti setiap orang perseorangan atau badan hukum yang memproses data atas nama Perusahaan.</p>
                    <p><strong className="text-gray-900">Data Penggunaan</strong> mengacu pada data yang dikumpulkan secara otomatis, baik yang dihasilkan dari penggunaan Layanan atau dari infrastruktur Layanan itu sendiri.</p>
                    <p><strong className="text-gray-900">Situs Web</strong> mengacu pada XinXun, dapat diakses pada https://xinxun.us</p>
                    <p><strong className="text-gray-900">Anda</strong> berarti individu yang mengakses atau menggunakan Layanan, atau perusahaan, atau entitas hukum lainnya atas nama individu tersebut yang mengakses atau menggunakan Layanan, sesuai dengan yang berlaku.</p>
                  </div>
                </div>

                {/* Data Collection */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:database" className="w-5 h-5" style={{ color: primaryColor }} />
                    Mengumpulkan dan Menggunakan Data Pribadi Anda
                  </h2>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">Jenis Data yang Dikumpulkan</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Data Pribadi</h4>
                      <p className="mb-2">Saat menggunakan Layanan Kami, Kami mungkin meminta Anda untuk memberikan informasi yang dapat diidentifikasi secara pribadi yang dapat digunakan untuk menghubungi atau mengidentifikasi Anda. Informasi yang dapat diidentifikasi secara pribadi mungkin termasuk, tetapi tidak terbatas pada:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Nama depan dan nama belakang</li>
                        <li>Nomor telepon</li>
                        <li>Data Penggunaan</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Data Penggunaan</h4>
                      <p>Data Penggunaan dikumpulkan secara otomatis saat menggunakan Layanan. Data Penggunaan mungkin termasuk informasi seperti alamat Protokol Internet Perangkat Anda (mis. alamat IP), jenis browser, versi browser, halaman Layanan kami yang Anda kunjungi, waktu dan tanggal kunjungan Anda, waktu yang dihabiskan di halaman tersebut, pengidentifikasi perangkat unik dan data diagnostik lainnya.</p>
                    </div>
                  </div>
                </div>

                {/* Cookies */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:cookie" className="w-5 h-5" style={{ color: primaryColor }} />
                    Teknologi Pelacakan dan Cookies
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Kami menggunakan Cookies dan teknologi pelacakan serupa untuk melacak aktivitas di Layanan Kami dan menyimpan informasi tertentu. Teknologi pelacakan yang Kami gunakan meliputi beacon, tag, dan skrip untuk mengumpulkan dan melacak informasi serta untuk meningkatkan dan menganalisis Layanan Kami.</p>

                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Jenis Cookies yang Kami Gunakan:</h4>
                      <ul className="list-disc list-inside ml-2 space-y-2">
                        <li><strong className="text-gray-900">Cookies Penting/Pokok:</strong> Cookies ini penting untuk menyediakan layanan yang tersedia melalui Situs Web dan untuk memungkinkan Anda menggunakan beberapa fiturnya.</li>
                        <li><strong className="text-gray-900">Cookies Kebijakan/Pemberitahuan Penerimaan Cookies:</strong> Cookies ini mengidentifikasi apakah pengguna telah menerima penggunaan cookies di Situs Web.</li>
                        <li><strong className="text-gray-900">Cookies Fungsionalitas:</strong> Cookies ini memungkinkan kami mengingat pilihan yang Anda buat saat menggunakan Situs Web, seperti mengingat detail login atau preferensi bahasa Anda.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use of Data */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:chart-line" className="w-5 h-5" style={{ color: primaryColor }} />
                    Penggunaan Data Pribadi Anda
                  </h2>
                  <div className="text-gray-700">
                    <p className="mb-2">Perusahaan dapat menggunakan Data Pribadi untuk tujuan berikut:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                      <li>Untuk menyediakan dan memelihara Layanan kami, termasuk untuk memantau penggunaan Layanan kami</li>
                      <li>Untuk mengelola Akun Anda: untuk mengelola pendaftaran Anda sebagai pengguna Layanan</li>
                      <li>Untuk pelaksanaan kontrak: pengembangan, kepatuhan dan pelaksanaan kontrak pembelian untuk produk, item atau layanan yang telah Anda beli</li>
                      <li>Untuk menghubungi Anda: Untuk menghubungi Anda melalui email, panggilan telepon, SMS, atau bentuk komunikasi elektronik lainnya</li>
                      <li>Untuk memberikan berita, penawaran khusus, dan informasi umum tentang barang, layanan dan acara lain yang Kami tawarkan</li>
                      <li>Untuk mengelola permintaan Anda: Untuk menangani dan mengelola permintaan Anda kepada Kami</li>
                      <li>Untuk transfer bisnis: Kami dapat menggunakan informasi Anda untuk mengevaluasi atau melakukan merger, divestasi, restrukturisasi, reorganisasi, pembubaran, atau penjualan atau transfer lain dari sebagian atau seluruh aset Kami</li>
                      <li>Untuk tujuan lain: Kami dapat menggunakan informasi Anda untuk tujuan lain, seperti analisis data, mengidentifikasi tren penggunaan, menentukan efektivitas kampanye promosi kami</li>
                    </ul>
                  </div>
                </div>

                {/* Data Retention */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:clock-outline" className="w-5 h-5" style={{ color: primaryColor }} />
                    Penyimpanan Data Pribadi Anda
                  </h2>
                  <p className="text-gray-700">
                    Perusahaan akan menyimpan Data Pribadi Anda hanya selama diperlukan untuk tujuan yang diuraikan dalam Kebijakan Privasi ini. Kami akan menyimpan dan menggunakan Data Pribadi Anda sejauh yang diperlukan untuk mematuhi kewajiban hukum kami, menyelesaikan sengketa, dan menegakkan perjanjian dan kebijakan hukum kami.
                  </p>
                </div>

                {/* Data Security */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:security" className="w-5 h-5" style={{ color: primaryColor }} />
                    Keamanan Data Pribadi Anda
                  </h2>
                  <p className="text-gray-700">
                    Keamanan Data Pribadi Anda penting bagi Kami, tetapi ingatlah bahwa tidak ada metode transmisi melalui Internet, atau metode penyimpanan elektronik yang 100% aman. Meskipun Kami berusaha menggunakan cara yang masuk akal secara komersial untuk melindungi Data Pribadi Anda, Kami tidak dapat menjamin keamanan absolutnya.
                  </p>
                </div>

                {/* Children's Privacy */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:account-child" className="w-5 h-5" style={{ color: primaryColor }} />
                    Privasi Anak-anak
                  </h2>
                  <p className="text-gray-700">
                    Layanan kami tidak ditujukan untuk siapa pun yang berusia di bawah 18 tahun. Kami tidak secara sadar mengumpulkan informasi yang dapat diidentifikasi secara pribadi dari siapa pun yang berusia di bawah 18 tahun. Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan Data Pribadi kepada Kami, silakan hubungi Kami.
                  </p>
                </div>

                {/* Changes to Policy */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:update" className="w-5 h-5" style={{ color: primaryColor }} />
                    Perubahan pada Kebijakan Privasi ini
                  </h2>
                  <p className="text-gray-700">
                    Kami dapat memperbarui Kebijakan Privasi Kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini. Kami akan memberi tahu Anda melalui email dan/atau pemberitahuan yang menonjol di Layanan Kami, sebelum perubahan menjadi efektif dan memperbarui tanggal "Terakhir diperbarui" di bagian atas Kebijakan Privasi ini.
                  </p>
                </div>

                {/* Contact */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:email" className="w-5 h-5" style={{ color: primaryColor }} />
                    Hubungi Kami
                  </h2>
                  <p className="text-gray-700 mb-3">
                    Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Icon icon="mdi:email" className="w-5 h-5" style={{ color: primaryColor }} />
                      <span className="text-gray-900 font-medium">help@xinxun.us</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
