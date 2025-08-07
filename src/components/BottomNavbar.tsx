
import { HomeIcon, PlusCircleIcon, UserIcon } from "./Icons";

interface BottomNavBarProps {
    onAddClick: () => void;
}

export default function BottomNavBar({ onAddClick }: BottomNavBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-secondary shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
            <div className="max-w-5xl mx-auto h-16 flex items-center justify-around">
                <button className="flex flex-col items-center justify-center text-primary cursor-pointer">
                    <HomeIcon />
                    <span className="text-xs font-semibold">Início</span>
                </button>
                <button 
                    onClick={onAddClick}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg hover:opacity-90 transition-transform transform hover:scale-110 cursor-pointer"
                    aria-label="Adicionar subscrição"
                >
                    <PlusCircleIcon />
                </button>
                <button className="flex flex-col items-center justify-center text-text-light hover:text-primary transition-colors cursor-pointer">
                    <UserIcon />
                    <span className="text-xs">Perfil</span>
                </button>
            </div>
        </div>
    );
}