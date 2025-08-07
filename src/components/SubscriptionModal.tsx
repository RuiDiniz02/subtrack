
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Subscription } from '@/lib/types';
import { XIcon } from './Icons';

const categories = ["Entretenimento", "Trabalho", "Educação", "Fitness", "Outro"];

interface SubscriptionModalProps {
    onClose: () => void;
    onSave: (data: Omit<Subscription, 'id'>) => void;
    initialData: Subscription | null;
}
export default function SubscriptionModal({ onClose, onSave, initialData }: SubscriptionModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [nextBillingDate, setNextBillingDate] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPrice(String(initialData.price));
            setBillingCycle(initialData.billingCycle);
            setNextBillingDate(initialData.nextBillingDate);
            setCategory(initialData.category || categories[0]);
        } else {
            setNextBillingDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !nextBillingDate) return;
        onSave({
            name,
            price: parseFloat(price),
            billingCycle,
            nextBillingDate,
            category,
            startDate: initialData?.startDate || new Date().toISOString(),
        });
    };

    const isEditing = initialData !== null;

    const modalContent = (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-base-100 rounded-lg shadow-2xl p-6 w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-text-light hover:text-text-main cursor-pointer">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-text-main">
                    {isEditing ? 'Editar Subscrição' : 'Nova Subscrição'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" required placeholder="Nome (ex: Netflix, Spotify)" />
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" min="0" step="0.01" required placeholder="Preço (€)" />
                    <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'monthly' | 'yearly')} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary">
                        <option value="monthly">Mensal</option>
                        <option value="yearly">Anual</option>
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div>
                        <label htmlFor="nextBillingDate" className="block text-sm font-medium text-text-light mb-1">Próximo Pagamento</label>
                        <input type="date" id="nextBillingDate" value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold transition-colors text-text-light cursor-pointer">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-action hover:opacity-90 rounded-lg font-bold text-white transition-colors cursor-pointer">
                            {isEditing ? 'Guardar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (!isMounted) return null;
    return createPortal(modalContent, document.body);
}
