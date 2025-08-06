'use client'; // Necessário para componentes com hooks no Next.js App Router

import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously,
    Auth // Importar o tipo Auth
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    deleteDoc,
    query,
    setLogLevel,
    Firestore, // Importar o tipo Firestore
    DocumentData
} from 'firebase/firestore';

// --- Configuração do Firebase ---
// As suas credenciais do Firebase.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- Definições de Tipos (TypeScript) ---

// Define a estrutura de uma subscrição
interface Subscription {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: string;
}

// Omit<Subscription, 'id'> cria um tipo que tem todos os campos de Subscription, exceto 'id'
type NewSubscription = Omit<Subscription, 'id'>;


// --- Componentes de Ícones (SVG) ---
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


// --- Componente Principal da Aplicação ---
export default function App() {
    // Estado para os serviços do Firebase com tipos explícitos
    const [auth, setAuth] = useState<Auth | null>(null);
    const [db, setDb] = useState<Firestore | null>(null);
    
    // Estado da aplicação com tipos explícitos
    const [userId, setUserId] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // ID da aplicação
    const appId = 'subtrack-app-9425a';

    // Efeito para inicializar o Firebase e a autenticação
    useEffect(() => {
        // Evita reinicializar a app em cada renderização no modo de desenvolvimento
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        
        setAuth(authInstance);
        setDb(dbInstance);
        setLogLevel('debug');

        const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    await signInAnonymously(authInstance);
                } catch (error) {
                    console.error("Erro ao fazer login anónimo:", error);
                }
            }
            setIsLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    // Efeito para carregar as subscrições do utilizador em tempo real
    useEffect(() => {
        if (!db || !userId) return;

        const subscriptionsCollectionPath = `artifacts/${appId}/users/${userId}/subscriptions`;
        const q = query(collection(db, subscriptionsCollectionPath));

        const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
            const subsData: Subscription[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as DocumentData;
                subsData.push({ 
                    id: doc.id,
                    name: data.name,
                    price: data.price,
                    billingCycle: data.billingCycle,
                    startDate: data.startDate
                });
            });
            setSubscriptions(subsData);
        }, (error) => {
            console.error("Erro ao carregar subscrições:", error);
        });

        return () => unsubscribeFirestore();
    }, [db, userId, appId]);

    // --- Funções de Lógica de Negócio ---

    const addSubscription = async (subscription: NewSubscription) => {
        if (!db || !userId) return;
        try {
            const subscriptionsCollectionPath = `artifacts/${appId}/users/${userId}/subscriptions`;
            await addDoc(collection(db, subscriptionsCollectionPath), subscription);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao adicionar subscrição:", error);
        }
    };

    const deleteSubscription = async (id: string) => {
        if (!db || !userId) return;
        try {
            const subscriptionDocPath = `artifacts/${appId}/users/${userId}/subscriptions/${id}`;
            await deleteDoc(doc(db, subscriptionDocPath));
        } catch (error) {
            console.error("Erro ao remover subscrição:", error);
        }
    };

    const dashboardStats = useMemo(() => {
        const monthlyTotal = subscriptions
            .filter(s => s.billingCycle === 'monthly')
            .reduce((acc, s) => acc + s.price, 0);

        const yearlyTotal = subscriptions
            .filter(s => s.billingCycle === 'yearly')
            .reduce((acc, s) => acc + s.price, 0);

        const totalAnnualCost = monthlyTotal * 12 + yearlyTotal;
        const totalMonthlyCost = totalAnnualCost / 12;

        return {
            count: subscriptions.length,
            monthly: totalMonthlyCost.toFixed(2),
            yearly: totalAnnualCost.toFixed(2),
        };
    }, [subscriptions]);

    // --- Renderização ---

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">A carregar...</div>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-green-400">Subtrack</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
                    >
                        <PlusCircleIcon />
                        <span className="hidden sm:inline">Adicionar</span>
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard title="Total Mensal" value={`€${dashboardStats.monthly}`} />
                    <StatCard title="Total Anual" value={`€${dashboardStats.yearly}`} />
                    <StatCard title="Nº de Subscrições" value={String(dashboardStats.count)} />
                </div>

                <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
                    <h2 className="text-xl font-semibold mb-4">As Suas Subscrições</h2>
                    <div className="space-y-4">
                        {subscriptions.length > 0 ? (
                            subscriptions.map(sub => (
                                <SubscriptionItem key={sub.id} subscription={sub} onDelete={deleteSubscription} />
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">Ainda não tem subscrições. Adicione a sua primeira!</p>
                        )}
                    </div>
                </div>
                <footer className="text-center mt-8 text-gray-500 text-xs">
                    <p>Conectado como utilizador:</p>
                    <p className="font-mono break-all">{userId}</p>
                </footer>
            </div>

            {isModalOpen && (
                <AddSubscriptionModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={addSubscription} 
                />
            )}
        </div>
    );
}

// --- Componentes de UI Auxiliares com Tipos ---

interface StatCardProps {
    title: string;
    value: string;
}

const StatCard = ({ title, value }: StatCardProps) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center transition-transform transform hover:scale-105">
        <h3 className="text-gray-400 text-sm font-medium uppercase">{title}</h3>
        <p className="text-2xl sm:text-3xl font-bold text-green-400">{value}</p>
    </div>
);

interface SubscriptionItemProps {
    subscription: Subscription;
    onDelete: (id: string) => void;
}

const SubscriptionItem = ({ subscription, onDelete }: SubscriptionItemProps) => (
    <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
        <div>
            <p className="font-bold text-lg">{subscription.name}</p>
            <p className="text-sm text-gray-300">
                {subscription.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
            </p>
        </div>
        <div className="flex items-center gap-4">
            <p className="text-lg font-semibold text-green-400">€{subscription.price.toFixed(2)}</p>
            <button 
                onClick={() => onDelete(subscription.id)} 
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"
                aria-label={`Remover ${subscription.name}`}
            >
                <Trash2Icon />
            </button>
        </div>
    </div>
);

interface AddSubscriptionModalProps {
    onClose: () => void;
    onSave: (subscription: NewSubscription) => void;
}

const AddSubscriptionModal = ({ onClose, onSave }: AddSubscriptionModalProps) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) return;
        onSave({
            name,
            price: parseFloat(price),
            billingCycle,
            startDate: new Date().toISOString(),
        });
        setName('');
        setPrice('');
        setBillingCycle('monthly');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-white">Nova Subscrição</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome (ex: Netflix, Spotify)</label>
                        <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Preço (€)</label>
                        <input 
                            type="number" 
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-300 mb-1">Ciclo de Faturação</label>
                        <select 
                            id="billingCycle"
                            value={billingCycle}
                            onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        >
                            <option value="monthly">Mensal</option>
                            <option value="yearly">Anual</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-green-500 hover:bg-green-600 rounded-lg font-bold text-white transition-colors">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
