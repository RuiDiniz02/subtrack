
export interface Subscription {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: string;
    nextBillingDate: string;
    category: string;
    logoUrl?: string; // Opcional: para guardar o URL do logotipo
}

// Nova interface para a nossa base de dados de serviços
export interface Service {
    id: string;
    name: string;
    domain: string;
    category: string;
}