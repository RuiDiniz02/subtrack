'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOutIcon } from "./Icons";
import Image from "next/image"; // Importar

export default function Profile() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (loading || !user) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return (
        <div className="bg-base-100 rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-text-main mb-6 text-center">My Profile</h2>
            <div className="flex flex-col items-center gap-4">
                {user.photoURL && (
                    <Image 
                      src={user.photoURL} 
                      alt="Profile picture" 
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full" 
                    />
                )}
                <div className="text-center">
                    <p className="text-xl font-semibold text-text-main">{user.displayName}</p>
                    <p className="text-text-light">{user.email}</p>
                </div>
                <button 
                    onClick={handleSignOut}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-error/10 text-error font-bold py-3 px-4 rounded-lg hover:bg-error hover:text-white transition-colors cursor-pointer"
                >
                    <LogOutIcon />
                    Sign Out
                </button>
            </div>
        </div>
    );
}