
import React, { useState, useEffect } from "react";
import Chart from "@/components/ui/chart";
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval, startOfWeek, endOfWeek, getHours, getDay, getMonth, getDate } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { supabase } from "@/integrations/supabase/client";
import { TimeRange } from "@/hooks/useDashboardData";

interface DashboardChartProps {
  data?: { month: string; revenue: number }[];
  title?: string;
  description?: string;
}

const DashboardChart = ({ data, title, description }: DashboardChartProps = {}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("week");
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setRevenueData(data);
      setIsLoading(false);
    } else {
      fetchRevenueData();
    }
  }, [selectedTimeRange, data]);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const { data: receipts, error } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching receipts:", error);
        return;
      }

      const groupedData = processDataByTimeRange(receipts, selectedTimeRange);
      setRevenueData(groupedData);
    } catch (error) {
      console.error("Error in fetchRevenueData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processDataByTimeRange = (receipts, timeRange: TimeRange) => {
    if (!receipts || receipts.length === 0) return [];

    const convertedReceipts = receipts.map(receipt => ({
      ...receipt,
      created_at: receipt.created_at // The date is already in ISO format
    }));

    let groupedData = [];

    switch (timeRange) {
      case "today":
        groupedData = groupByHour(convertedReceipts);
        break;
      case "week":
        groupedData = groupByDayOfWeek(convertedReceipts);
        break;
      case "month":
        groupedData = groupByWeekOfMonth(convertedReceipts);
        break;
      case "year":
        groupedData = groupByMonth(convertedReceipts);
        break;
      case "all":
        groupedData = groupByMonth(convertedReceipts); // Default to monthly view for "all"
        break;
      default:
        groupedData = groupByDayOfWeek(convertedReceipts);
    }

    return groupedData;
  };

  const groupByHour = (receipts) => {
    // Group by hour (24-hour breakdown)
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      name: i,
      revenue: 0,
      count: 0
    }));

    const today = startOfDay(new Date());
    const todayReceipts = receipts.filter(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      return isWithinInterval(receiptDate, {
        start: today,
        end: endOfDay(today)
      });
    });

    todayReceipts.forEach(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      const hour = getHours(receiptDate);
      hourlyData[hour].revenue += receipt.total || 0;
      hourlyData[hour].count += 1;
    });

    return hourlyData;
  };

  const groupByDayOfWeek = (receipts) => {
    // Group by days (Monday through Sunday)
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      name: i,
      label: daysOfWeek[i],
      revenue: 0,
      count: 0
    }));

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    
    const thisWeekReceipts = receipts.filter(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      return isWithinInterval(receiptDate, {
        start: weekStart,
        end: weekEnd
      });
    });

    thisWeekReceipts.forEach(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      const day = getDay(receiptDate);
      dailyData[day].revenue += receipt.total || 0;
      dailyData[day].count += 1;
    });

    return dailyData;
  };

  const groupByWeekOfMonth = (receipts) => {
    // Group by weeks (Week 1, Week 2, etc.)
    const weeklyData = Array.from({ length: 5 }, (_, i) => ({
      name: i + 1,
      label: `Week ${i + 1}`,
      revenue: 0,
      count: 0
    }));

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const thisMonthReceipts = receipts.filter(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      return isWithinInterval(receiptDate, {
        start: monthStart,
        end: monthEnd
      });
    });

    thisMonthReceipts.forEach(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      const dayOfMonth = getDate(receiptDate);
      const weekNumber = Math.ceil(dayOfMonth / 7);
      if (weekNumber >= 1 && weekNumber <= 5) {
        weeklyData[weekNumber - 1].revenue += receipt.total || 0;
        weeklyData[weekNumber - 1].count += 1;
      }
    });

    return weeklyData;
  };

  const groupByMonth = (receipts) => {
    // Group by months (January through December)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: i + 1,
      label: months[i],
      revenue: 0,
      count: 0
    }));

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    
    const thisYearReceipts = receipts.filter(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      return isWithinInterval(receiptDate, {
        start: yearStart,
        end: yearEnd
      });
    });

    thisYearReceipts.forEach(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      const month = getMonth(receiptDate);
      monthlyData[month].revenue += receipt.total || 0;
      monthlyData[month].count += 1;
    });

    return monthlyData;
  };

  // Format X-axis tick values based on time range
  const formatXAxisTick = (value: any): string => {
    if (value === undefined || value === null) return '';
    
    switch (selectedTimeRange) {
      case 'today':
        return `${value}:00`;
      case 'week': {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return daysOfWeek[value] || value.toString();
      }
      case 'month':
        return `Week ${value}`;
      case 'year': {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return value >= 1 && value <= 12 ? months[value - 1] : value.toString();
      }
      default:
        return value.toString();
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
            formatXAxisTick={formatXAxisTick}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
