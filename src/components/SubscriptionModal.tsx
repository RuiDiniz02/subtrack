'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Subscription, Service } from '@/lib/types';
import { XIcon } from './Icons';
import Image from 'next/image';
import { debounce } from 'lodash';
import servicesData from '@/lib/services.json';

const categories = ["Entertainment", "Work", "Education", "Fitness", "Other"];

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
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Service[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPrice(String(initialData.price));
            setBillingCycle(initialData.billingCycle);
            setNextBillingDate(initialData.nextBillingDate);
            setCategory(initialData.category || categories[0]);
            setLogoUrl(initialData.logoUrl);
            setSearchQuery(initialData.name);
        } else {
            setNextBillingDate(new Date().toISOString().split('T')[0]);
        }
    }, [initialData]);

    const debouncedSearch = useCallback(
        debounce((queryText: string) => {
            if (queryText.length < 2) {
                setSearchResults([]);
                return;
            }
            const results = servicesData.filter(service =>
                service.name.toLowerCase().includes(queryText.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results as Service[]);
        }, 200),
        [] // As dependências estão vazias porque a função não depende de props ou estado externo
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setName(query);
        setLogoUrl(undefined);
        debouncedSearch(query);
    };

    const handleSelectService = (service: Service) => {
        setName(service.name);
        setSearchQuery(service.name);
        setCategory(service.category);
        setLogoUrl(`https://logo.clearbit.com/${service.domain}`);
        setSearchResults([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !nextBillingDate) return;
        
        const dataToSave: Omit<Subscription, 'id'> = {
            name,
            price: parseFloat(price),
            billingCycle,
            nextBillingDate,
            category,
            startDate: initialData?.startDate || new Date().toISOString(),
            ...(logoUrl && { logoUrl }),
        };
        
        onSave(dataToSave);
    };

    const isEditing = initialData !== null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="bg-base-100 rounded-lg shadow-2xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-text-light hover:text-text-main cursor-pointer"><XIcon /></button>
                <h2 className="text-2xl font-bold mb-6 text-text-main">{isEditing ? 'Edit Subscription' : 'New Subscription'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input type="text" value={searchQuery} onChange={handleSearchChange} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" required placeholder="Search for a service (e.g., Spotify)" />
                        {searchResults.length > 0 && (
                            <ul className="absolute z-10 w-full bg-base-100 border border-secondary rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map(service => (
                                    <li key={service.id}>
                                        <button type="button" onClick={() => handleSelectService(service)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-base-200">
                                            <Image src={`https://logo.clearbit.com/${service.domain}`} alt={service.name} width={24} height={24} className="rounded-full" />
                                            <span>{service.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" min="0" step="0.01" required placeholder="Price (€)" />
                    <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'monthly' | 'yearly')} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div>
                        <label htmlFor="nextBillingDate" className="block text-sm font-medium text-text-light mb-1">Next Payment</label>
                        <input type="date" id="nextBillingDate" value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)} className="w-full bg-base-200 border-secondary text-text-main rounded-lg p-3 focus:ring-2 focus:ring-primary" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold transition-colors text-text-light cursor-pointer">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-action hover:opacity-90 rounded-lg font-bold text-white transition-colors cursor-pointer">{isEditing ? 'Save Changes' : 'Add Subscription'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (!isMounted) return null;
    return createPortal(modalContent, document.body);
}
