'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "./Icons";

export default function Header() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <header className="bg-base-100 shadow-sm p-4">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">Subtrack</h1>
                <div className="flex items-center gap-4">
                    {user?.photoURL && (
                        <img src={user.photoURL} alt="Foto de perfil" className="w-10 h-10 rounded-full" />
                    )}
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-text-light hover:text-error transition-colors cursor-pointer">
                        <LogOutIcon />
                        <span className="hidden sm:inline">Terminar Sessão</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
