'use client';

import Header from "@/components/Header";
import BottomNavbar from "@/components/BottomNavbar";
import Profile from "@/components/Profile";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const handleAddClick = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <Profile />
      </main>
      <BottomNavbar onAddClick={handleAddClick} />
    </div>
  );
}