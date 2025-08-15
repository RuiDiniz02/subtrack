'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { Subscription, UserProfile } from '@/lib/types';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, DollarSignIcon, TrendingUpIcon } from './Icons';

const currencySymbols: { [key in UserProfile['currency']]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
};

const formatCurrency = (value: number, currency: UserProfile['currency']) => {
    return `${currencySymbols[currency]}${value.toFixed(2)}`;
};

export default function Analysis() {
    const { user, profile, loading: loadingAuth } = useAuth();
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        if (!loadingAuth && !user) {
            router.push('/login');
        }
    }, [user, loadingAuth, router]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, `users/${user.uid}/subscriptions`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
            setSubscriptions(subsData);
        });
        return () => unsubscribe();
    }, [user]);

    const analysisData = useMemo(() => {
        if (subscriptions.length === 0) {
            return { topCategory: null, mostExpensiveSub: null, yearlySavings: 0, categorySpending: [], totalSpending: 0 };
        }

        const categorySpending: { [key: string]: number } = {};
        let mostExpensiveSub: Subscription | null = null;
        let yearlySavings = 0;

        subscriptions.forEach(sub => {
            const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
            
            const currentMostExpensivePrice = mostExpensiveSub ? (mostExpensiveSub.billingCycle === 'yearly' ? mostExpensiveSub.price / 12 : mostExpensiveSub.price) : -1;
            if (monthlyPrice > currentMostExpensivePrice) {
                mostExpensiveSub = sub;
            }

            if(sub.billingCycle === 'yearly') {
                yearlySavings += (sub.price * 0.1);
            }

            const category = sub.category || 'Uncategorized';
            if (!categorySpending[category]) {
                categorySpending[category] = 0;
            }
            categorySpending[category] += monthlyPrice;
        });

        const sortedCategories = Object.entries(categorySpending).sort(([, a], [, b]) => b - a);
        
        const totalSpending = sortedCategories.reduce((acc, [, total]) => acc + total, 0);

        return {
            topCategory: sortedCategories[0] ? sortedCategories[0][0] : null,
            mostExpensiveSub,
            yearlySavings,
            categorySpending: sortedCategories,
            totalSpending
        };
    }, [subscriptions]);

    const loading = loadingAuth || !profile;

    if (loading || !user) {
        return <div className="text-center p-10">Loading analysis...</div>;
    }

    return (
        <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-3xl font-bold text-text-main">Insights</h1>

            {subscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisData.mostExpensiveSub && (
                        <div className="bg-base-100 p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangleIcon className="text-error" />
                                <h2 className="text-xl font-semibold text-text-main">Highest Expense</h2>
                            </div>
                            <p className="text-text-light">Your most expensive subscription is <span className="font-bold text-text-main">{analysisData.mostExpensiveSub.name}</span>.</p>
                            <p className="text-3xl font-bold text-error mt-2">{formatCurrency(analysisData.mostExpensiveSub.price, profile.currency)}
                                <span className="text-base font-medium text-text-light">/{analysisData.mostExpensiveSub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            </p>
                        </div>
                    )}

                     {analysisData.yearlySavings > 0 && (
                        <div className="bg-base-100 p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUpIcon className="text-action" />
                                <h2 className="text-xl font-semibold text-text-main">Yearly Savings</h2>
                            </div>
                            <p className="text-text-light">By paying annually, you are saving approximately</p>
                            <p className="text-3xl font-bold text-action mt-2">{formatCurrency(analysisData.yearlySavings, profile.currency)}
                                <span className="text-base font-medium text-text-light">/yr</span>
                            </p>
                        </div>
                    )}

                    <div className="md:col-span-2 bg-base-100 p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSignIcon className="text-primary" />
                            <h2 className="text-xl font-semibold text-text-main">Spending by Category</h2>
                        </div>
                        <div className="space-y-4">
                            {analysisData.categorySpending.map(([category, total]) => (
                                <div key={category}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-text-main">{category}</span>
                                        <span className="text-text-light">{formatCurrency(total, profile.currency)}/mo</span>
                                    </div>
                                    <div className="w-full bg-base-200 rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(total / (analysisData.totalSpending || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="bg-base-100 rounded-lg p-8 text-center text-text-light">
                    <p>Add some subscriptions to see your financial insights.</p>
                </div>
            )}
        </motion.div>
    );
}
