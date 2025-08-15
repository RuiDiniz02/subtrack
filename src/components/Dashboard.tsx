// src/components/Dashboard.tsx

'use client';

import React, { useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation'; // Removido
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'; // Imports limpos
import type { Subscription } from '@/lib/types';

import Header from './Header';
import BottomNavbar from './BottomNavbar';
import StatsCarousel from './StatsCarousel';
import SubscriptionItem from './SubscriptionItem';
import SubscriptionModal from './SubscriptionModal';
import CategoryChart from './CategoryChart';

export default function Dashboard() {
    const { user, loading: carregandoAuth } = useAuth();
    const { settings, loading: carregandoSettings } = useSettings();
    // const router = useRouter(); // Removido
    const [assinaturas] = useState<Subscription[]>([]); // setAssinaturas removido
    const [modalAberto, setModalAberto] = useState(false);
    const [assinaturaEmEdicao, setAssinaturaEmEdicao] = useState<Subscription | null>(null);
    
    const { estatisticasPainel, dadosCategoria } = useMemo(() => {
        const custosMensais: { [key: string]: number } = {};
        let totalAnual = 0;

        assinaturas.forEach(sub => {
            const precoMensal = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
            totalAnual += precoMensal * 12;
            const categoria = sub.category || 'Uncategorized';
            if (!custosMensais[categoria]) custosMensais[categoria] = 0;
            custosMensais[categoria] += precoMensal;
        });

        return {
            estatisticasPainel: {
                monthly: (totalAnual / 12).toFixed(2),
                yearly: totalAnual.toFixed(2),
            },
            dadosCategoria: Object.keys(custosMensais).map(cat => ({ name: cat, value: parseFloat(custosMensais[cat].toFixed(2)) })),
        };
    }, [assinaturas]);

    const assinaturasOrdenadas = useMemo(() => {
        return [...assinaturas].sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
    }, [assinaturas]);

    const tratarCliqueAdicionar = () => {
        setAssinaturaEmEdicao(null);
        setModalAberto(true);
    };

    const tratarCliqueEditar = (assinatura: Subscription) => {
        setAssinaturaEmEdicao(assinatura);
        setModalAberto(true);
    };

    const tratarFecharModal = () => {
        setModalAberto(false);
        setAssinaturaEmEdicao(null);
    };

    const tratarGuardarAssinatura = async (dados: Omit<Subscription, 'id'>) => {
        if (!user || !db) return;
        const caminho = `users/${user.uid}/subscriptions`;
        if (assinaturaEmEdicao) {
            await updateDoc(doc(db, caminho, assinaturaEmEdicao.id), dados);
        } else {
            await addDoc(collection(db, caminho), dados);
        }
        tratarFecharModal();
    };

    const apagarAssinatura = async (id: string) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, `users/${user.uid}/subscriptions/${id}`));
    };

    const loading = carregandoAuth || carregandoSettings;

    if (loading || !user || !settings) {
        return <div className="flex items-center justify-center h-screen bg-base-200 text-text-main">Verifying authentication...</div>;
    }
    
    return (
        <div className="bg-base-100 text-text-main min-h-screen pb-24">
            <Header />
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                <StatsCarousel monthly={estatisticasPainel.monthly} yearly={estatisticasPainel.yearly} currency={settings.currency} />

                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">Upcoming Renewals</h2>
                    <div className="space-y-0">
                        {assinaturasOrdenadas.length > 0 ? (
                            assinaturasOrdenadas.map(sub => (
                                <SubscriptionItem key={sub.id} subscription={sub} onEdit={() => tratarCliqueEditar(sub)} onDelete={() => apagarAssinatura(sub.id)} currency={settings.currency} />
                            ))
                        ) : (
                            <div className="bg-base-200 rounded-lg p-8 text-center text-text-light">
                                <p>You don&apos;t have any subscriptions yet.</p>
                                <p className="text-sm mt-2">Click the &apos;+&apos; button to add your first one!</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {dadosCategoria.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-text-main">Expenses by Category</h2>
                        <div className="bg-base-100 rounded-lg p-4 sm:p-6">
                            <CategoryChart data={dadosCategoria} currency={settings.currency} />
                        </div>
                    </div>
                )}
            </div>
            
            <BottomNavbar onAddClick={tratarCliqueAdicionar} />

            {modalAberto && (
                <SubscriptionModal onClose={tratarFecharModal} onSave={tratarGuardarAssinatura} initialData={assinaturaEmEdicao} currency={settings.currency} />
            )}
        </div>
    );
}