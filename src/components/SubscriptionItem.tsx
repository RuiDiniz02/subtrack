
'use client';

import type { Subscription } from '@/lib/types';
import { CalendarIcon, EditIcon, Trash2Icon } from './Icons';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ... (função formatDate sem alterações) ...

interface SubscriptionItemProps {
    subscription: Subscription;
    onEdit: () => void;
    onDelete: () => void;
}
export default function SubscriptionItem({ subscription, onEdit, onDelete }: SubscriptionItemProps) {
    const itemVariants = {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    };

    return (
        <motion.div 
          className="flex items-center justify-between bg-base-200 p-4 rounded-lg transition-colors"
          variants={itemVariants}
          whileHover={{ backgroundColor: 'var(--color-secondary)' }}
        >
            {/* ... (conteúdo do item sem alterações) ... */}
        </motion.div>
    );
}
