
export interface Subscription {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: string;
    nextBillingDate: string;
    category: string;
    logoUrl?: string;
}

export interface Service {
    id: string;
    name: string;
    domain: string;
    category: string;
}

// Nova interface para o perfil completo do utilizador
export interface UserProfile {
    currency: 'EUR' | 'USD' | 'GBP';
    plan: 'free' | 'pro';
}