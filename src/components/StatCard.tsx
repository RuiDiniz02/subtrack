
import { motion } from 'framer-motion';

interface StatCardProps { title: string; value: string; }
export default function StatCard({ title, value }: StatCardProps) {
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
          className="bg-base-100 p-6 rounded-lg shadow-md"
          variants={itemVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
            <h3 className="text-text-light text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{value}</p>
        </motion.div>
    );
}
