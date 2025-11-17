// components/BottomNavbar.js
import { Home, Users, CreditCard, User } from 'lucide-react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

const navItems = [
  { label: 'Home', icon: Home, href: '/dashboard', key: 'dashboard' },
  { label: 'Komisi', icon: Users, href: '/referral', key: 'referral' },
  { label: 'Spin', icon: null, href: '/spin-wheel', key: 'spin' }, // Center item
  { label: 'Forum', icon: CreditCard, href: '/forum', key: 'forum' },
  { label: 'Profil', icon: User, href: '/profile', key: 'profile' },
];

export default function BottomNavbar() {
  const router = useRouter();
  const primaryColor = '#fe7d17';

  const renderNavItem = (item) => {
    // Skip the center spin item, will be rendered separately
    if (item.key === 'spin') {
      return (
        <div key={item.key} className="flex-1 flex justify-center">
          <button
            onClick={() => router.push(item.href)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon icon="mdi:slot-machine" className="w-7 h-7 text-white" />
          </button>
        </div>
      );
    }

    const IconComponent = item.icon;
    const isActive = router.pathname === item.href ||
                    (item.key === 'dashboard' && router.pathname === '/') ||
                    (item.href !== '/dashboard' && router.pathname.startsWith(item.href));

    return (
      <button
        key={item.key}
        onClick={() => router.push(item.href)}
        className="flex-1 flex flex-col items-center justify-center py-2 transition-all active:scale-95"
      >
        <div className={`p-2 rounded-xl transition-all ${
          isActive ? 'bg-[#fe7d17]/10' : ''
        }`}>
          <IconComponent
            className={`w-6 h-6 transition-colors ${
              isActive ? 'text-[#fe7d17]' : 'text-gray-400'
            }`}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>
        <span className={`text-[10px] font-medium mt-1 transition-colors ${
          isActive ? 'text-[#fe7d17]' : 'text-gray-500'
        }`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-3 px-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(renderNavItem)}
          </div>
        </div>
      </div>
    </div>
  );
}
