'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RevenuePieChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export function RevenuePieChart({ data }: RevenuePieChartProps) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-sm col-span-2 lg:col-span-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Revenue Breakdown</h3>
        <p className="text-sm text-muted-foreground">Distribution across modules</p>
      </div>
      <div className="h-[300px] w-full">
        {data && data.length > 0 && data.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No revenue data available.
          </div>
        )}
      </div>
    </div>
  );
}
