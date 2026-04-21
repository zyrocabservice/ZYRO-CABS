

'use client';

import type { Booking, Location, TollPlaza } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Pie, Cell, Legend } from 'recharts';
import { subDays, format, startOfDay } from 'date-fns';
import { DollarSign, BookOpen, Users, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { ChartTooltip, ChartTooltipContent, ChartContainer, DonutChart } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import TollMap from './toll-map';
import MiniAnalyticsCharts from './mini-analytics-charts';

interface AnalyticsDashboardProps {
  bookings: Booking[];
  geocodedLocations: Location[];
  tollPlazas: TollPlaza[];
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: { title: string, value: string, icon: React.ElementType, trend: 'up' | 'down', trendValue: string }) => {
    const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;
    const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                    <TrendIcon className={`h-4 w-4 mr-1 ${trendColor}`} />
                    <span className={`${trendColor}`}>{trendValue}</span> from last week
                </p>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsDashboard({ bookings, geocodedLocations, tollPlazas }: AnalyticsDashboardProps) {

  const last30DaysData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => subDays(today, i)).reverse();
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayBookings = bookings.filter(b => b.createdAt && startOfDay(new Date(b.createdAt)).getTime() === dayStart.getTime());
      
      const dailyRevenue = dayBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);
      
      return {
        date: format(day, 'MMM d'),
        Bookings: dayBookings.length,
        Revenue: dailyRevenue
      };
    });
  }, [bookings]);

  const cumulativeRevenueData = useMemo(() => {
    let cumulativeRevenue = 0;
    return last30DaysData.map(d => {
        cumulativeRevenue += d.Revenue;
        return {
            date: d.date,
            Bookings: d.Bookings,
            Revenue: cumulativeRevenue
        }
    })
  }, [last30DaysData]);


  const bookingStatusDistribution = useMemo(() => {
    const statusCounts = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const topDropoffAreas = useMemo(() => {
    const locationCounts = bookings.reduce((acc, booking) => {
      const location = booking.dropLocation || 'Unknown';
      // Simple name cleanup
      const cleanLocation = location.split(',')[0].trim();
      acc[cleanLocation] = (acc[cleanLocation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5

    const total = bookings.length;
    if (total === 0) return [];

    return sortedLocations.map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100,
    }));
  }, [bookings]);

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);
  const totalCustomers = new Set(bookings.map(b => b.customer?.mobile)).size;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  
  const chartConfig = {
      revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
      bookings: { label: "Bookings", color: "hsl(var(--chart-1))" },
  } satisfies any;
  
  const tollLocations = useMemo(() => tollPlazas.map(p => ({ lat: p.Latitude, lng: p.Longitude, name: p['Plaza Name'] })), [tollPlazas]);


  return (
    <div className="space-y-4">
        <MiniAnalyticsCharts 
          bookings={bookings}
          totalBookings={totalBookings}
          totalRevenue={totalRevenue}
          totalCustomers={totalCustomers}
          completionRate={completionRate}
        />

        <div className="grid grid-cols-1 gap-4">
             <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Booking Figures</CardTitle>
                    <CardDescription>Bookings and cumulative revenue over the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <AreaChart data={cumulativeRevenueData} margin={{ left: 12, right: 12 }}>
                             <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                yAxisId="left"
                            />
                            <YAxis
                                orientation="right"
                                yAxisId="right"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                             <defs>
                                <linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="Bookings" yAxisId="left" stroke="hsl(var(--chart-1))" fill="url(#fillBookings)" strokeWidth={2} />
                            <Area type="monotone" dataKey="Revenue" yAxisId="right" stroke="hsl(var(--chart-2))" fill="url(#fillRevenue)" strokeWidth={2} />
                            <Legend />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Statistics</CardTitle>
                      <CardDescription>Distribution of booking statuses.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                          <DonutChart>
                              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                              <Pie
                                  data={bookingStatusDistribution}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={60}
                                  strokeWidth={5}
                              >
                                  {bookingStatusDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                                  ))}
                              </Pie>
                              <Legend
                                  content={({ payload }) => {
                                  return (
                                      <ul className="grid gap-2 mt-4">
                                      {payload?.map((entry, index) => {
                                          const { name, value } = bookingStatusDistribution[index];
                                          const percentage = (value / totalBookings) * 100;
                                          return (
                                              <li key={`item-${index}`} className="flex items-center justify-between text-sm">
                                                  <div className="flex items-center gap-2">
                                                      <span
                                                      className="h-2.5 w-2.5 rounded-full"
                                                      style={{ backgroundColor: entry.color }}
                                                      />
                                                      <span className="capitalize text-muted-foreground">{name.replace(/_/g, ' ')}</span>
                                                  </div>
                                                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                                              </li>
                                          )
                                      })}
                                      </ul>
                                  )
                                  }}
                              />
                          </DonutChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader>
                      <CardTitle>Top Drop-off Areas</CardTitle>
                      <CardDescription>The most popular destination locations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {topDropoffAreas.length > 0 ? topDropoffAreas.map((area, index) => (
                          <div key={area.name} className="space-y-1">
                              <div className="flex justify-between text-sm font-medium">
                                  <span>{area.name}</span>
                                  <span>{area.percentage.toFixed(0)}%</span>
                              </div>
                              <Progress value={area.percentage} className="h-2" style={{'--tw-bg-opacity': '1', backgroundColor: `hsl(var(--chart-${index + 1}))` } as React.CSSProperties} />
                          </div>
                      )) : (
                          <p className="text-muted-foreground text-sm">No booking data available to show top areas.</p>
                      )}
                  </CardContent>
              </Card>
            </div>
        </div>
    </div>
  );
}
    
