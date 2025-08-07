export interface Subscription {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    startDate: string;
    nextBillingDate: string;
    category: string; // Novo campo
}
