// pages/licenses.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

// License data grouped by country
const licensesData = {
  'Indonesia': [
    {
      institution: 'Otoritas Jasa Keuangan',
      company: 'PT Xdana Investa Indonesia',
      logo: '/licenses/ojk_indonesia.png'
    },
    {
      institution: 'Kementerian Komunikasi dan Digital',
      company: 'Xinxun, Ltd',
      logo: '/licenses/komdigi_indonesia.png'
    }
  ],
  'China': [
    {
      institution: 'China Securities Regulatory Commission',
      company: 'Xinxun, Ltd',
      logo: '/licenses/csrc_china.png'
    }
  ],
  'Hongkong': [
    {
      institution: 'Securities and Futures Commission',
      company: 'Xinxun Limited',
      logo: '/licenses/sfc_hongkong.png'
    }
  ],
  'Singapore': [
    {
      institution: 'Monetary Authority of Singapore',
      company: 'Xinxun SG, Ltd',
      logo: '/licenses/mas_singapore.png'
    },
    {
      institution: 'Government of Singapore Investment Corporation',
      company: 'Xinxun SG, Ltd',
      logo: '/licenses/gic_singapore.png'
    }
  ],
  'Malaysia': [
    {
      institution: 'Securities Commission Malaysia',
      company: 'Xinxun PLT',
      logo: '/licenses/scm_malaysia.png'
    }
  ],
  'Philippines': [
    {
      institution: 'Securities and Exchange Commission',
      company: 'Xinxun, Inc',
      logo: '/licenses/sec_philippines.png'
    }
  ],
  'Thailand': [
    {
      institution: 'Securities and Exchange Commission',
      company: 'Xinxun Thai, Ltd',
      logo: '/licenses/sec_thailand.png'
    }
  ],
  'Vietnam': [
    {
      institution: 'Ministry of Planning and Investment',
      company: 'Xinxun Company',
      logo: '/licenses/mpi_vietnam.png'
    }
  ]
};

export default function Licenses() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const primaryColor = '#fe7d17';

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'XinXun',
        });
      } catch (e) {
        setApplicationData({ name: 'XinXun' });
      }
    } else {
      setApplicationData({ name: 'XinXun' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Head>
        <title>{applicationData?.name || 'XinXun'} | Lisensi & Regulasi</title>
        <meta name="description" content={`Lisensi dan regulasi ${applicationData?.name || 'XinXun'}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <Icon icon="mdi:certificate" className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-base font-bold text-gray-900">Lisensi & Regulasi</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lisensi & Regulasi</h2>
          <p className="text-sm text-gray-600">
            {applicationData?.name || 'XinXun'} beroperasi dengan lisensi dan regulasi resmi di berbagai negara
          </p>
        </div>

        {/* Licenses by Country */}
        <div className="space-y-8">
          {Object.entries(licensesData).map(([country, licenses]) => (
            <div key={country}>
              {/* Country Header */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">{country}</h3>
              
              {/* License Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {licenses.map((license, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all"
                  >
                    {/* Institution Name */}
                    <h4 className="font-bold text-gray-900 text-base mb-3">
                      {license.institution}
                    </h4>
                    
                    {/* Company Name */}
                    <p className="font-medium text-base text-gray-700 mb-5 leading-relaxed min-h-[3rem]">
                      {license.company}
                    </p>
                    
                    {/* Institution Logo */}
                    <div className="flex justify-center items-center pt-4 border-t border-gray-100">
                      <div className="relative w-full max-w-[180px] h-20">
                        <Image
                          src={license.logo}
                          alt={license.institution}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            const container = e.target.parentElement;
                            if (container) {
                              container.innerHTML = '<div class="text-gray-400 text-xs text-center">Logo tidak tersedia</div>';
                            }
                          }}
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-6 mt-8">
          © 2025 {applicationData?.company || 'XinXun, Ltd'}. All rights reserved.
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}

