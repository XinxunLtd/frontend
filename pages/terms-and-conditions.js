// pages/terms-and-conditions.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';

export default function TermsAndConditions() {
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
        <title>{applicationData?.name || 'XinXun'} | Syarat dan Ketentuan</title>
        <meta name="description" content={`${applicationData?.name || 'XinXun'} Syarat dan Ketentuan`} />
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
              <Icon icon="mdi:file-document" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Syarat dan Ketentuan</h1>
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
                  src="/cover_logo.png"
                  alt="XinXun Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Syarat dan Ketentuan</h1>
              <p className="text-gray-600 text-sm">Terakhir diperbarui: 10 November 2025</p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="space-y-6 text-sm leading-relaxed">

                {/* Introduction */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:file-document" className="w-5 h-5" style={{ color: primaryColor }} />
                    Pengantar
                  </h2>
                  <p className="text-gray-700 mb-3">
                    Harap baca syarat dan ketentuan ini dengan seksama sebelum menggunakan Layanan Kami.
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
                    <p><strong className="text-gray-900">Aplikasi</strong> berarti program perangkat lunak yang disediakan oleh Perusahaan yang diunduh oleh Anda di perangkat elektronik apa pun, bernama XinXun.</p>
                    <p><strong className="text-gray-900">Toko Aplikasi</strong> berarti layanan distribusi digital yang dioperasikan dan dikembangkan oleh Apple Inc. (Apple App Store) atau Google Inc. (Google Play Store) di mana Aplikasi telah diunduh.</p>
                    <p><strong className="text-gray-900">Afiliasi</strong> berarti entitas yang mengontrol, dikontrol oleh, atau berada di bawah kontrol bersama dengan pihak, di mana "kontrol" berarti kepemilikan 50% atau lebih dari saham, kepentingan ekuitas atau sekuritas lain yang berhak memberikan suara untuk pemilihan direktur atau otoritas pengelola lainnya.</p>
                    <p><strong className="text-gray-900">Negara</strong> mengacu pada: Kota Dongguan, Tiongkok</p>
                    <p><strong className="text-gray-900">Perusahaan</strong> (disebut sebagai "Perusahaan" atau "Kami" dalam Perjanjian ini) mengacu pada XinXun, Ltd, Second Floor, Building C, Golden Sword Industrial Park, 12 Longjiang Road, Xiekeng Village, Qingxy Town, Dongguan City, Guangdong City, Tingkok.</p>
                    <p><strong className="text-gray-900">Perangkat</strong> berarti perangkat apa pun yang dapat mengakses Layanan seperti komputer, telepon seluler atau tablet digital.</p>
                    <p><strong className="text-gray-900">Layanan</strong> mengacu pada Aplikasi atau Situs Web atau keduanya.</p>
                    <p><strong className="text-gray-900">Syarat dan Ketentuan</strong> (juga disebut sebagai "Syarat") berarti Syarat dan Ketentuan ini yang membentuk keseluruhan perjanjian antara Anda dan Perusahaan mengenai penggunaan Layanan.</p>
                    <p><strong className="text-gray-900">Layanan Media Sosial Pihak Ketiga</strong> berarti layanan atau konten apa pun (termasuk data, informasi, produk atau layanan) yang disediakan oleh pihak ketiga yang dapat ditampilkan, disertakan atau tersedia oleh Layanan.</p>
                    <p><strong className="text-gray-900">Situs Web</strong> mengacu pada XinXun, dapat diakses dari https://xinxun.us</p>
                    <p><strong className="text-gray-900">Anda</strong> berarti individu yang mengakses atau menggunakan Layanan, atau perusahaan, atau entitas hukum lainnya atas nama individu tersebut yang mengakses atau menggunakan Layanan, sesuai dengan yang berlaku.</p>
                  </div>
                </div>

                {/* Acknowledgment */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:handshake" className="w-5 h-5" style={{ color: primaryColor }} />
                    Pengakuan
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Ini adalah Syarat dan Ketentuan yang mengatur penggunaan Layanan ini dan perjanjian yang beroperasi antara Anda dan Perusahaan. Syarat dan Ketentuan ini menetapkan hak dan kewajiban semua pengguna mengenai penggunaan Layanan.</p>
                    <p>Akses dan penggunaan Anda terhadap Layanan ini dikondisikan pada penerimaan dan kepatuhan Anda terhadap Syarat dan Ketentuan ini. Syarat dan Ketentuan ini berlaku untuk semua pengunjung, pengguna dan lainnya yang mengakses atau menggunakan Layanan.</p>
                    <p>Dengan mengakses atau menggunakan Layanan, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari Syarat dan Ketentuan ini, maka Anda tidak boleh mengakses Layanan.</p>
                    <p>Anda menyatakan bahwa Anda berusia di atas 18 tahun. Perusahaan tidak mengizinkan mereka yang berusia di bawah 18 tahun untuk menggunakan Layanan.</p>
                    <p>Akses dan penggunaan Anda terhadap Layanan juga dikondisikan pada penerimaan dan kepatuhan Anda terhadap Kebijakan Privasi Perusahaan. Kebijakan Privasi Kami menjelaskan kebijakan dan prosedur Kami dalam mengumpulkan, menggunakan dan mengungkapkan informasi pribadi Anda ketika Anda menggunakan Aplikasi atau Situs Web dan memberitahu Anda tentang hak privasi Anda dan bagaimana hukum melindungi Anda. Harap baca Kebijakan Privasi Kami dengan seksama sebelum menggunakan Layanan Kami.</p>
                  </div>
                </div>

                {/* Links to Other Websites */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:link" className="w-5 h-5" style={{ color: primaryColor }} />
                    Tautan ke Situs Web Lain
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Layanan Kami mungkin berisi tautan ke situs web atau layanan pihak ketiga yang tidak dimiliki atau dikontrol oleh Perusahaan.</p>
                    <p>Perusahaan tidak memiliki kontrol atas, dan tidak bertanggung jawab atas, konten, kebijakan privasi, atau praktik dari situs web atau layanan pihak ketiga mana pun. Anda lebih lanjut mengakui dan menyetujui bahwa Perusahaan tidak akan bertanggung jawab atau berkewajiban, secara langsung atau tidak langsung, atas kerusakan atau kerugian yang disebabkan atau diduga disebabkan oleh atau sehubungan dengan penggunaan atau ketergantungan pada konten, barang atau layanan apa pun yang tersedia di atau melalui situs web atau layanan tersebut.</p>
                    <p>Kami sangat menyarankan Anda untuk membaca syarat dan ketentuan serta kebijakan privasi dari situs web atau layanan pihak ketiga yang Anda kunjungi.</p>
                  </div>
                </div>

                {/* Termination */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:stop-circle" className="w-5 h-5" style={{ color: primaryColor }} />
                    Penghentian
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Kami dapat menghentikan atau menangguhkan akses Anda segera, tanpa pemberitahuan sebelumnya atau tanggung jawab, karena alasan apa pun, termasuk tanpa batasan jika Anda melanggar Syarat dan Ketentuan ini.</p>
                    <p>Setelah penghentian, hak Anda untuk menggunakan Layanan akan berhenti segera.</p>
                  </div>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:shield-alert" className="w-5 h-5" style={{ color: primaryColor }} />
                    Pembatasan Tanggung Jawab
                  </h2>
                  <div className="space-y-3 text-gray-700 bg-red-50 p-4 rounded-lg border border-red-200">
                    <p>Terlepas dari kerusakan yang mungkin Anda alami, seluruh tanggung jawab Perusahaan dan salah satu pemasoknya di bawah ketentuan apa pun dari Syarat ini dan solusi eksklusif Anda untuk semua hal di atas akan dibatasi pada jumlah yang benar-benar dibayar oleh Anda melalui Layanan atau 100 USD jika Anda belum membeli apa pun melalui Layanan.</p>
                    <p>Sejauh maksimum yang diizinkan oleh hukum yang berlaku, dalam keadaan apa pun Perusahaan atau pemasoknya tidak akan bertanggung jawab atas kerusakan khusus, insidental, tidak langsung, atau konsekuensial apa pun (termasuk, tetapi tidak terbatas pada, kerusakan untuk kehilangan keuntungan, kehilangan data atau informasi lain, untuk gangguan bisnis, untuk cedera pribadi, kehilangan privasi yang timbul dari atau dengan cara apa pun terkait dengan penggunaan atau ketidakmampuan untuk menggunakan Layanan, perangkat lunak pihak ketiga dan/atau perangkat keras pihak ketiga yang digunakan dengan Layanan, atau sebaliknya sehubungan dengan ketentuan apa pun dari Syarat ini), bahkan jika Perusahaan atau pemasok mana pun telah diberitahu tentang kemungkinan kerusakan tersebut dan bahkan jika solusi gagal dari tujuannya yang penting.</p>
                    <p>Beberapa negara bagian tidak mengizinkan pengecualian jaminan tersirat atau pembatasan tanggung jawab untuk kerusakan insidental atau konsekuensial, yang berarti bahwa beberapa pembatasan di atas mungkin tidak berlaku. Di negara bagian ini, tanggung jawab masing-masing pihak akan dibatasi pada sejauh maksimum yang diizinkan oleh hukum.</p>
                  </div>
                </div>

                {/* AS IS Disclaimer */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-5 h-5" style={{ color: primaryColor }} />
                    Penafian "SEBAGAIMANA ADANYA" dan "SEBAGAIMANA TERSEDIA"
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Layanan disediakan untuk Anda "SEBAGAIMANA ADANYA" dan "SEBAGAIMANA TERSEDIA" dan dengan semua kesalahan dan cacat tanpa jaminan apa pun. Sejauh maksimum yang diizinkan di bawah hukum yang berlaku, Perusahaan, atas namanya sendiri dan atas nama Afiliasinya dan pemberi lisensi dan penyedia layanannya masing-masing, secara tegas menyangkal semua jaminan, baik eksplisit, tersirat, statutori atau lainnya, sehubungan dengan Layanan, termasuk semua jaminan tersirat dari kemampuan jual, kesesuaian untuk tujuan tertentu, judul dan non-pelanggaran, dan jaminan yang mungkin timbul dari jalannya transaksi, jalannya kinerja, penggunaan atau praktik perdagangan.</p>
                    <p>Tanpa batasan pada hal di atas, Perusahaan tidak memberikan jaminan atau komitmen apa pun, dan tidak membuat pernyataan apa pun bahwa Layanan akan memenuhi persyaratan Anda, mencapai hasil yang dimaksudkan, kompatibel atau bekerja dengan perangkat lunak, aplikasi, sistem atau layanan lain apa pun, beroperasi tanpa gangguan, memenuhi standar kinerja atau keandalan apa pun atau bebas dari kesalahan atau bahwa kesalahan atau cacat apa pun dapat atau akan diperbaiki.</p>
                    <p>Tanpa membatasi hal di atas, baik Perusahaan maupun penyedia perusahaan tidak membuat pernyataan atau jaminan apa pun, eksplisit atau tersirat: (i) mengenai operasi atau ketersediaan Layanan, atau informasi, konten, dan materi atau produk yang disertakan di dalamnya; (ii) bahwa Layanan akan tidak terputus atau bebas dari kesalahan; (iii) mengenai keakuratan, keandalan, atau keaktualan informasi atau konten apa pun yang disediakan melalui Layanan; atau (iv) bahwa Layanan, servernya, konten, atau email yang dikirim dari atau atas nama Perusahaan bebas dari virus, skrip, trojan horse, worm, malware, timebombs atau komponen berbahaya lainnya.</p>
                    <p>Beberapa yurisdiksi tidak mengizinkan pengecualian jenis jaminan tertentu atau pembatasan pada hak statutori yang berlaku dari konsumen, sehingga beberapa atau semua pengecualian dan pembatasan di atas mungkin tidak berlaku untuk Anda. Tetapi dalam kasus seperti itu, pengecualian dan pembatasan yang ditetapkan dalam bagian ini akan diterapkan pada sejauh maksimum yang dapat diberlakukan di bawah hukum yang berlaku.</p>
                  </div>
                </div>

                {/* Governing Law */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:gavel" className="w-5 h-5" style={{ color: primaryColor }} />
                    Hukum yang Berlaku
                  </h2>
                  <p className="text-gray-700">
                    Hukum Negara, tidak termasuk aturan konflik hukumnya, akan mengatur Syarat ini dan penggunaan Anda terhadap Layanan. Penggunaan Anda terhadap Aplikasi juga dapat tunduk pada hukum lokal, negara bagian, nasional, atau internasional lainnya.
                  </p>
                </div>

                {/* Disputes Resolution */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:scale-balance" className="w-5 h-5" style={{ color: primaryColor }} />
                    Penyelesaian Sengketa
                  </h2>
                  <p className="text-gray-700">
                    Jika Anda memiliki kekhawatiran atau sengketa tentang Layanan, Anda menyetujui untuk terlebih dahulu mencoba menyelesaikan sengketa secara informal dengan menghubungi Perusahaan.
                  </p>
                </div>

                {/* For European Union Users */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:flag" className="w-5 h-5" style={{ color: primaryColor }} />
                    Untuk Pengguna Uni Eropa (EU)
                  </h2>
                  <p className="text-gray-700">
                    Jika Anda adalah konsumen Uni Eropa, Anda akan mendapat manfaat dari ketentuan wajib hukum negara tempat Anda tinggal.
                  </p>
                </div>

                {/* United States Legal Compliance */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:shield-check" className="w-5 h-5" style={{ color: primaryColor }} />
                    Kepatuhan Hukum Amerika Serikat
                  </h2>
                  <p className="text-gray-700">
                    Anda menyatakan dan menjamin bahwa (i) Anda tidak berada di negara yang menjadi subjek embargo pemerintah Amerika Serikat, atau yang telah ditetapkan oleh pemerintah Amerika Serikat sebagai negara "pendukung teroris", dan (ii) Anda tidak terdaftar dalam daftar pemerintah Amerika Serikat tentang pihak yang dilarang atau dibatasi.
                  </p>
                </div>

                {/* Severability and Waiver */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:file-cog" className="w-5 h-5" style={{ color: primaryColor }} />
                    Pemisahan dan Pengabaian
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Pemisahan</h4>
                      <p>Jika ketentuan apa pun dari Syarat ini dianggap tidak dapat diberlakukan atau tidak valid, ketentuan tersebut akan diubah dan ditafsirkan untuk mencapai tujuan ketentuan tersebut sejauh mungkin di bawah hukum yang berlaku dan ketentuan yang tersisa akan terus berlaku penuh.</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Pengabaian</h4>
                      <p>Kecuali sebagaimana diatur di sini, kegagalan untuk menggunakan hak atau memerlukan kinerja kewajiban di bawah Syarat ini tidak akan mempengaruhi kemampuan pihak untuk menggunakan hak tersebut atau memerlukan kinerja tersebut kapan saja setelahnya, dan pengabaian pelanggaran tidak akan merupakan pengabaian pelanggaran selanjutnya.</p>
                    </div>
                  </div>
                </div>

                {/* Translation Interpretation */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:translate" className="w-5 h-5" style={{ color: primaryColor }} />
                    Interpretasi Terjemahan
                  </h2>
                  <p className="text-gray-700">
                    Syarat dan Ketentuan ini mungkin telah diterjemahkan jika Kami telah membuatnya tersedia untuk Anda di Layanan kami. Anda menyetujui bahwa teks bahasa Inggris asli akan berlaku dalam kasus sengketa.
                  </p>
                </div>

                {/* Changes to Terms */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:update" className="w-5 h-5" style={{ color: primaryColor }} />
                    Perubahan pada Syarat dan Ketentuan ini
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>Kami berhak, atas kebijakan mutlak Kami, untuk memodifikasi atau mengganti Syarat ini kapan saja. Jika revisi bersifat material, Kami akan melakukan upaya yang wajar untuk memberikan pemberitahuan setidaknya 30 hari sebelum syarat baru berlaku. Apa yang merupakan perubahan material akan ditentukan atas kebijakan mutlak Kami.</p>
                    <p>Dengan terus mengakses atau menggunakan Layanan Kami setelah revisi tersebut berlaku, Anda menyetujui untuk terikat oleh syarat yang direvisi. Jika Anda tidak setuju dengan syarat baru, sebagian atau seluruhnya, harap berhenti menggunakan situs web dan Layanan.</p>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="mdi:email" className="w-5 h-5" style={{ color: primaryColor }} />
                    Hubungi Kami
                  </h2>
                  <p className="text-gray-700 mb-3">
                    Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, Anda dapat menghubungi kami:
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
