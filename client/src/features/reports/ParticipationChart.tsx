import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function ParticipationChart({ data }: { data: { name: string; attendees: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d7" />
          <XAxis dataKey="name" stroke="#434655" fontSize={11} angle={-15} textAnchor="end" height={60} />
          <YAxis stroke="#434655" fontSize={12} />
          <Tooltip />
          <Bar dataKey="attendees" fill="#006c49" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
