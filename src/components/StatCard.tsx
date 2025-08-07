interface StatCardProps { title: string; value: string; }
export default function StatCard({ title, value }: StatCardProps) {
    return (
        <div className="bg-base-100 p-6 rounded-lg shadow-md">
            <h3 className="text-text-light text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-primary mt-2">{value}</p>
        </div>
    );
}
