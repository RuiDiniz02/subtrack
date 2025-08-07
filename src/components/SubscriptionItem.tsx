
import type { Subscription } from '@/lib/types';
import { CalendarIcon, EditIcon, Trash2Icon } from './Icons';

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00Z`);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

interface SubscriptionItemProps {
    subscription: Subscription;
    onEdit: () => void;
    onDelete: () => void;
}
export default function SubscriptionItem({ subscription, onEdit, onDelete }: SubscriptionItemProps) {
    return (
        <div className="flex items-center justify-between bg-base-200 p-4 rounded-lg hover:bg-secondary transition-colors">
            <div className="flex items-center gap-4 flex-grow">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                        {subscription.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-text-main">{subscription.name}</p>
                        <span className="px-2 py-0.5 bg-secondary text-text-light rounded-full text-xs font-semibold">{subscription.category || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-light mt-1">
                        <CalendarIcon />
                        <span>{formatDate(subscription.nextBillingDate)}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-lg font-semibold text-text-main">€{subscription.price.toFixed(2)}</p>
                <button onClick={onEdit} className="text-text-light hover:text-primary transition-colors p-2 rounded-full" aria-label={`Editar ${subscription.name}`}>
                    <EditIcon />
                </button>
                <button onClick={onDelete} className="text-text-light hover:text-error transition-colors p-2 rounded-full" aria-label={`Remover ${subscription.name}`}>
                    <Trash2Icon />
                </button>
            </div>
        </div>
    );
}
