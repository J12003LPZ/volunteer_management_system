import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function HoursByMonthChart({ data }: { data: { month: string; hours: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d7" />
          <XAxis dataKey="month" stroke="#434655" fontSize={12} />
          <YAxis stroke="#434655" fontSize={12} />
          <Tooltip />
          <Bar dataKey="hours" fill="#004ac6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
