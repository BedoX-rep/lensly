import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "@/components/ui/chart";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { supabase } from "@/integrations/supabase/client";
import { TimeRange } from "@/hooks/useDashboardData";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface DashboardChartProps {
  title?: string;
  description?: string;
}

const DashboardChart = ({ title, description }: DashboardChartProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedTimeRange]);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let start, end;

      switch (selectedTimeRange) {
        case 'day':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'week':
          start = startOfWeek(now);
          end = endOfWeek(now);
          break;
        case 'month':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'year':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          start = startOfWeek(now);
          end = endOfWeek(now);
      }

      const { data: receipts, error } = await supabase
        .from("receipts")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching receipts:", error);
        return;
      }

      const groupedData = processDataByTimeRange(receipts || [], selectedTimeRange);
      setRevenueData(groupedData);
    } catch (error) {
      console.error("Error in fetchRevenueData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processDataByTimeRange = (receipts: any[], timeRange: TimeRange) => {
    if (!receipts || receipts.length === 0) {
      return getEmptyDataStructure(timeRange);
    }

    switch (timeRange) {
      case 'day':
        return processHourlyData(receipts);
      case 'week':
        return processDailyData(receipts);
      case 'month':
        return processWeeklyData(receipts);
      case 'year':
        return processMonthlyData(receipts);
      default:
        return processDailyData(receipts);
    }
  };

  const processHourlyData = (receipts: any[]) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      name: `${i}:00`,
      revenue: 0
    }));

    receipts.forEach(receipt => {
      const date = parseISO(receipt.created_at);
      const hour = date.getHours();
      hourlyData[hour].revenue += receipt.total || 0;
    });

    return hourlyData;
  };

  const processDailyData = (receipts: any[]) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData = days.map(day => ({
      name: day,
      revenue: 0
    }));

    receipts.forEach(receipt => {
      const date = parseISO(receipt.created_at);
      const dayIndex = date.getDay();
      dailyData[dayIndex].revenue += receipt.total || 0;
    });

    return dailyData;
  };

  const processWeeklyData = (receipts: any[]) => {
    const weeklyData = Array.from({ length: 5 }, (_, i) => ({
      name: `Week ${i + 1}`,
      revenue: 0
    }));

    receipts.forEach(receipt => {
      const date = parseISO(receipt.created_at);
      const weekNumber = Math.floor(date.getDate() / 7);
      if (weekNumber < 5) {
        weeklyData[weekNumber].revenue += receipt.total || 0;
      }
    });

    return weeklyData;
  };

  const processMonthlyData = (receipts: any[]) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyData = months.map(month => ({
      name: month,
      revenue: 0
    }));

    receipts.forEach(receipt => {
      const date = parseISO(receipt.created_at);
      const monthIndex = date.getMonth();
      monthlyData[monthIndex].revenue += receipt.total || 0;
    });

    return monthlyData;
  };

  const getEmptyDataStructure = (timeRange: TimeRange) => {
    switch (timeRange) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          revenue: 0
        }));
      case 'week':
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          .map(day => ({ name: day, revenue: 0 }));
      case 'month':
        return Array.from({ length: 5 }, (_, i) => ({
          name: `Week ${i + 1}`,
          revenue: 0
        }));
      case 'year':
        return ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December']
          .map(month => ({ name: month, revenue: 0 }));
      default:
        return [];
    }
  };

  return (
    <Card className="col-span-3 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title || "Revenue Trend"}</CardTitle>
          <TimeRangeSelector 
            value={selectedTimeRange} 
            onChange={(range) => setSelectedTimeRange(range)} 
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Chart
            data={revenueData}
            type="bar"
            xAxis="name"
            yAxis="revenue"
            height={300}
            colors={["#0369a1"]}
            showLegend={false}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardChart;