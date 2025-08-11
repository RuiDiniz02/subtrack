
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusCircleIcon, UserIcon } from "./Icons";

interface BottomNavBarProps {
    onAddClick: () => void;
}

export default function BottomNavBar({ onAddClick }: BottomNavBarProps) {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-secondary shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <div className="max-w-5xl mx-auto h-16 flex items-center justify-around">
                <Link href="/dashboard" className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'text-text-light hover:text-primary'}`}>
                    <HomeIcon />
                    <span className="text-xs font-semibold">Início</span>
                </Link>
                <button 
                    onClick={onAddClick}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg hover:opacity-90 transition-transform transform hover:scale-110 cursor-pointer"
                    aria-label="Adicionar subscrição"
                >
                    <PlusCircleIcon />
                </button>
                <Link href="/profile" className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${pathname === '/profile' ? 'text-primary' : 'text-text-light hover:text-primary'}`}>
                    <UserIcon />
                    <span className="text-xs">Perfil</span>
                </Link>
            </div>
        </div>
    );
}
