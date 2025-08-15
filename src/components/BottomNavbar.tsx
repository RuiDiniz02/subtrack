'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusCircleIcon, UserIcon, BarChartIcon, StarIcon, WalletIcon } from "./Icons";
import { useAuth } from "@/contexts/AuthContext";

interface BottomNavbarProps {
    onAddClick: () => void;
}

export default function BottomNavbar({ onAddClick }: BottomNavbarProps) {
    const pathname = usePathname();
    const { profile } = useAuth();

    const isPro = profile?.plan === 'pro';

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-secondary shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <div className="max-w-5xl mx-auto h-16 grid grid-cols-5 items-center">
                <Link href="/dashboard" className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'text-text-light hover:text-primary'}`}>
                    <HomeIcon />
                    <span className="text-xs font-semibold">Home</span>
                </Link>
                
                <Link href={isPro ? "/analysis" : "/upgrade"} className={`relative flex flex-col items-center justify-center cursor-pointer transition-colors ${pathname === '/analysis' ? 'text-primary' : 'text-text-light hover:text-primary'}`}>
                    {!isPro && <StarIcon className="absolute top-0 right-1.5 w-4 h-4 text-yellow-400" />}
                    <BarChartIcon />
                    <span className="text-xs font-semibold">Analysis</span>
                </Link>

                <div className="flex justify-center">
                    <button 
                        onClick={onAddClick}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg hover:opacity-90 transition-transform transform hover:scale-110 cursor-pointer"
                        aria-label="Add subscription"
                    >
                        <PlusCircleIcon />
                    </button>
                </div>

                <button className="flex flex-col items-center justify-center text-text-light cursor-not-allowed opacity-50">
                    <WalletIcon />
                    <span className="text-xs">Wallet</span>
                </button>
                
                <Link href="/profile" className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-text-light hover:text-primary'}`}>
                    <UserIcon />
                    <span className="text-xs">Profile</span>
                </Link>
            </div>
        </div>
    );
}