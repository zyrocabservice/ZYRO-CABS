

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Eye, CloudDownload, BarChart2, Radio, BookOpen, Users, CheckCircle, DollarSign } from 'lucide-react';
import { subDays, format, startOfDay } from 'date-fns';
import type { Booking } from '@/lib/types';


type ChartData = {
  value: number;
}[];

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const MiniChartCard = ({ title, value, icon: Icon, chartType, chartData, chartColor }: { title: string, value: string, icon: React.ElementType, chartType: 'area' | 'bar', chartData: ChartData, chartColor: string }) => {
  const ChartComponent = chartType === 'area' ? AreaChart : BarChart;
  const ChartElement = chartType === 'area' ? Area : Bar;

  return (
    <Card className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
            <div className="text-2xl font-bold">{value}</div>
            <div className="h-16 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ChartComponent data={chartData}>
                        <defs>
                            <linearGradient id={`color-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <ChartElement
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            fillOpacity={1}
                            fill={chartType === 'area' ? `url(#color-${title.replace(/\s+/g, '')})` : chartColor}
                            strokeWidth={2}
                        />
                    </ChartComponent>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  )
}

interface MiniAnalyticsChartsProps {
    bookings: Booking[];
    totalBookings: number;
    totalRevenue: number;
    totalCustomers: number;
    completionRate: number;
}


export default function MiniAnalyticsCharts({ bookings, totalBookings, totalRevenue, totalCustomers, completionRate }: MiniAnalyticsChartsProps) {
  
  const dailyChartData = useMemo(() => {
    const last10Days = Array.from({ length: 10 }, (_, i) => subDays(new Date(), i)).reverse();
    
    return last10Days.map(day => {
        const dayStart = startOfDay(day);
        const dailyBookings = bookings.filter(b => b.createdAt && startOfDay(new Date(b.createdAt)).getTime() === dayStart.getTime());
        
        const dailyRevenue = dailyBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);
        
        const dailyUniqueCustomers = new Set(dailyBookings.map(b => b.customer?.mobile)).size;

        const dailyCompleted = dailyBookings.filter(b => b.status === 'completed').length;
        const dailyCompletionRate = dailyBookings.length > 0 ? (dailyCompleted / dailyBookings.length) * 100 : 0;

        return {
            bookings: { value: dailyBookings.length },
            revenue: { value: dailyRevenue },
            customers: { value: dailyUniqueCustomers },
            completion: { value: dailyCompletionRate },
        };
    });
  }, [bookings]);

  const bookingsChartData = dailyChartData.map(d => d.bookings);
  const revenueChartData = dailyChartData.map(d => d.revenue);
  const customersChartData = dailyChartData.map(d => d.customers);
  const completionChartData = dailyChartData.map(d => d.completion);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MiniChartCard 
            title="Total Bookings"
            value={formatNumber(totalBookings)}
            icon={BookOpen}
            chartType="area"
            chartData={bookingsChartData}
            chartColor="hsl(var(--primary))"
        />
        <MiniChartCard 
            title="Total Revenue"
            value={`Rs ${formatNumber(totalRevenue)}`}
            icon={DollarSign}
            chartType="bar"
            chartData={revenueChartData}
            chartColor="hsl(var(--chart-2))"
        />
        <MiniChartCard 
            title="Total Customers"
            value={formatNumber(totalCustomers)}
            icon={Users}
            chartType="area"
            chartData={customersChartData}
            chartColor="hsl(var(--chart-5))"
        />
        <MiniChartCard 
            title="Completion Rate"
            value={`${completionRate.toFixed(1)}%`}
            icon={CheckCircle}
            chartType="bar"
            chartData={completionChartData}
            chartColor="hsl(var(--destructive))"
        />
    </div>
  )
}

