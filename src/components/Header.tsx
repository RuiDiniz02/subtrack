'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "./Icons";
import Link from "next/link";
import Image from "next/image"; // Importar

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
                <Link href="/dashboard" className="text-2xl font-logo font-bold text-primary">
                  Subtrack
                </Link>
                <div className="flex items-center gap-4">
                    {user?.photoURL && (
                        <Image 
                          src={user.photoURL} 
                          alt="Foto de perfil" 
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full" 
                        />
                    )}
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-text-light hover:text-error transition-colors cursor-pointer">
                        <LogOutIcon />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
