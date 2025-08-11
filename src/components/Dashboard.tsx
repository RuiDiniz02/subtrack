
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, setLogLevel } from 'firebase/firestore';
import type { Subscription } from '@/lib/types';

import Header from './Header';
import BottomNavBar from './BottomNavbar'; // Corrigido
import StatCard from './StatCard';
import SubscriptionItem from './SubscriptionItem';
import SubscriptionModal from './SubscriptionModal';
import CategoryChart from './CategoryChart';

export default function Dashboard() {
    const { user, loading: carregandoAuth } = useAuth();
    const router = useRouter();
    const [assinaturas, setAssinaturas] = useState<Subscription[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [assinaturaEmEdicao, setAssinaturaEmEdicao] = useState<Subscription | null>(null);
    
    const appId = 'subtrack-app-9425a';

    useEffect(() => {
        if (!carregandoAuth && !user) {
            router.push('/login');
        }
    }, [user, carregandoAuth, router]);

    useEffect(() => {
        if (!user || !db) return;
        setLogLevel('debug');
        const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/subscriptions`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dadosAssinaturas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
            setAssinaturas(dadosAssinaturas);
        }, (error) => console.error("Erro ao carregar assinaturas:", error));
        return () => unsubscribe();
    }, [user, appId]);

    const assinaturasOrdenadas = useMemo(() => {
        return [...assinaturas].sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
    }, [assinaturas]);

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
                count: assinaturas.length,
                monthly: (totalAnual / 12).toFixed(2),
                yearly: totalAnual.toFixed(2),
            },
            dadosCategoria: Object.keys(custosMensais).map(cat => ({ name: cat, value: parseFloat(custosMensais[cat].toFixed(2)) })),
        };
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
        const caminho = `artifacts/${appId}/users/${user.uid}/subscriptions`;
        if (assinaturaEmEdicao) {
            await updateDoc(doc(db, caminho, assinaturaEmEdicao.id), dados);
        } else {
            await addDoc(collection(db, caminho), dados);
        }
        tratarFecharModal();
    };

    const apagarAssinatura = async (id: string) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/subscriptions/${id}`));
    };

    if (carregandoAuth || !user) {
        return <div className="flex items-center justify-center h-screen bg-base-200 text-text-main">Verifying authentication...</div>;
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    return (
        <div className="bg-base-200 text-text-main min-h-screen pb-24">
            <Header />
            <motion.div 
              className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
                    <StatCard title="Estimated Monthly Cost" value={`€${estatisticasPainel.monthly}`} />
                    <StatCard title="Total Yearly Cost" value={`€${estatisticasPainel.yearly}`} />
                    <StatCard title="Total Subscriptions" value={String(estatisticasPainel.count)} />
                </motion.div>

                <motion.div className="grid grid-cols-1 lg:grid-cols-5 gap-6" variants={containerVariants}>
                    <motion.div className="lg:col-span-3 bg-base-100 rounded-lg shadow-md p-4 sm:p-6" variants={containerVariants}>
                        <h2 className="text-xl font-semibold mb-4 text-text-main">Upcoming Renewals</h2>
                        <div className="space-y-3">
                            {assinaturasOrdenadas.length > 0 ? (
                                assinaturasOrdenadas.map(sub => (
                                    <SubscriptionItem key={sub.id} subscription={sub} onEdit={() => tratarCliqueEditar(sub)} onDelete={() => apagarAssinatura(sub.id)} />
                                ))
                            ) : (
                                <p className="text-text-light text-center py-8">You don't have any subscriptions yet.</p>
                            )}
                        </div>
                    </motion.div>
                    <motion.div className="lg:col-span-2 bg-base-100 rounded-lg shadow-md p-4 sm:p-6" variants={containerVariants}>
                         <h2 className="text-xl font-semibold mb-4 text-text-main">Expenses by Category</h2>
                         <CategoryChart data={dadosCategoria} />
                    </motion.div>
                </motion.div>
            </motion.div>
            
            <BottomNavBar onAddClick={tratarCliqueAdicionar} />

            {modalAberto && (
                <SubscriptionModal onClose={tratarFecharModal} onSave={tratarGuardarAssinatura} initialData={assinaturaEmEdicao} />
            )}
        </div>
    );
}
