'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on login page
    if (pathname === '/' || pathname === '/login') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-t-2 border-green-500/30">
            <div className="max-w-md mx-auto flex justify-around items-center p-2">
                <NavButton
                    icon="👤"
                    label="PROFILE"
                    isActive={pathname === '/profile'}
                    onClick={() => router.push('/profile')}
                />
                <NavButton
                    icon="🎯"
                    label="QUESTS"
                    isActive={pathname.includes('/quests')}
                    onClick={() => router.push('/quests')}
                />
                <NavButton
                    icon="🗑️"
                    label="CANS"
                    isActive={pathname.includes('/cans')}
                    onClick={() => router.push('/cans/request')}
                />
                <NavButton
                    icon="🏆"
                    label="RANK"
                    isActive={pathname === '/leaderboard'}
                    onClick={() => router.push('/leaderboard')}
                />
                <NavButton
                    icon="🎒"
                    label="ITEMS"
                    isActive={pathname === '/inventory'}
                    onClick={() => router.push('/inventory')}
                />
            </div>
        </div>
    );
}

function NavButton({ 
    icon, 
    label, 
    isActive, 
    onClick 
}: { 
    icon: string; 
    label: string; 
    isActive: boolean; 
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center p-2 rounded transition-colors ${
                isActive 
                    ? 'text-green-400' 
                    : 'text-gray-400 hover:text-green-400'
            }`}
        >
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
} 