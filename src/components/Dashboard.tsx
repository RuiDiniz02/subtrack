
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, db } from '@/contexts/AuthContext';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, setLogLevel } from 'firebase/firestore';
import type { Subscription } from '@/lib/types';

import Header from './Header';
import BottomNavbar from './BottomNavbar';
import StatCard from './StatCard';
import SubscriptionItem from './SubscriptionItem';
import SubscriptionModal from './SubscriptionModal';
import CategoryChart from './CategoryChart';
import { PlusCircleIcon } from './Icons';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    
    const appId = 'subtrack-app-9425a';

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        setLogLevel('debug');
        const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/subscriptions`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
            setSubscriptions(subsData);
        }, (error) => console.error("Erro ao carregar:", error));
        return () => unsubscribe();
    }, [user, appId]);

    const sortedSubscriptions = useMemo(() => {
        return [...subscriptions].sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
    }, [subscriptions]);

    const { dashboardStats, categoryData } = useMemo(() => {
        const monthlyCosts: { [key: string]: number } = {};
        let totalAnnual = 0;

        subscriptions.forEach(sub => {
            const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
            totalAnnual += monthlyPrice * 12;
            const category = sub.category || 'Sem Categoria';
            if (!monthlyCosts[category]) monthlyCosts[category] = 0;
            monthlyCosts[category] += monthlyPrice;
        });

        return {
            dashboardStats: {
                count: subscriptions.length,
                monthly: (totalAnnual / 12).toFixed(2),
                yearly: totalAnnual.toFixed(2),
            },
            categoryData: Object.keys(monthlyCosts).map(cat => ({ name: cat, value: parseFloat(monthlyCosts[cat].toFixed(2)) })),
        };
    }, [subscriptions]);

    const handleAddClick = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (subscription: Subscription) => {
        setEditingSubscription(subscription);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubscription(null);
    };

    const handleSaveSubscription = async (data: Omit<Subscription, 'id'>) => {
        if (!user) return;
        const path = `artifacts/${appId}/users/${user.uid}/subscriptions`;
        if (editingSubscription) {
            await updateDoc(doc(db, path, editingSubscription.id), data);
        } else {
            await addDoc(collection(db, path), data);
        }
        handleCloseModal();
    };

    const deleteSubscription = async (id: string) => {
        if (!user) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/subscriptions/${id}`));
    };

    if (loading || !user) {
        return <div className="flex items-center justify-center h-screen bg-base-200 text-text-main">A verificar autenticação...</div>;
    }

    return (
        <div className="bg-base-200 text-text-main min-h-screen pb-24">
            <Header />
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Custo Mensal Estimado" value={`€${dashboardStats.monthly}`} />
                    <StatCard title="Custo Anual Total" value={`€${dashboardStats.yearly}`} />
                    <StatCard title="Nº de Subscrições" value={String(dashboardStats.count)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 bg-base-100 rounded-lg shadow-md p-4 sm:p-6">
                        <h2 className="text-xl font-semibold mb-4 text-text-main">Próximas Renovações</h2>
                        <div className="space-y-3">
                            {sortedSubscriptions.length > 0 ? (
                                sortedSubscriptions.map(sub => (
                                    <SubscriptionItem key={sub.id} subscription={sub} onEdit={() => handleEditClick(sub)} onDelete={() => deleteSubscription(sub.id)} />
                                ))
                            ) : (
                                <p className="text-text-light text-center py-8">Ainda não tem subscrições para mostrar.</p>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-base-100 rounded-lg shadow-md p-4 sm:p-6">
                         <h2 className="text-xl font-semibold mb-4 text-text-main">Despesas por Categoria</h2>
                         <CategoryChart data={categoryData} />
                    </div>
                </div>
            </div>
            
            <BottomNavbar onAddClick={handleAddClick} />

            {isModalOpen && (
                <SubscriptionModal onClose={handleCloseModal} onSave={handleSaveSubscription} initialData={editingSubscription} />
            )}
        </div>
    );
}
