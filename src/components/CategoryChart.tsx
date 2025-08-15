// src/components/CategoryChart.tsx

'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// import type { UserSettings } from '@/lib/types'; // Removido

const currencySymbols = {
    EUR: '€',
    USD: '$',
    GBP: '£',
};

interface ChartData {
    name: string;
    value: number;
}

interface CategoryChartProps {
    data: ChartData[];
    currency: keyof typeof currencySymbols;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

export default function CategoryChart({ data, currency }: CategoryChartProps) {
    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-light">Add a subscription to see the chart.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currencySymbols[currency]}${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}