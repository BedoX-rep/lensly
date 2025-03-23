import React, { useState, useEffect } from "react";
import Chart from "@/components/ui/chart";
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval, startOfWeek, endOfWeek, getHours, getDay, getMonth, getWeek } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/integrations/supabase/queries";
import { TimeRange } from "@/hooks/useDashboardData";

interface DashboardChartProps {
  data?: { month: string; revenue: number }[];
  title?: string;
  description?: string;
}

const DashboardChart = ({ data, title, description }: DashboardChartProps = {}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<"day" | "week" | "month" | "year">("week");
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

      const timeZone = 'Africa/Casablanca'; // Morocco timezone
      const groupedData = processDataByTimeRange(receipts, selectedTimeRange, timeZone);
      setRevenueData(groupedData);
    } catch (error) {
      console.error("Error in fetchRevenueData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processDataByTimeRange = (receipts, timeRange: "day" | "week" | "month" | "year", timezone) => {
    if (!receipts || receipts.length === 0) return [];

    const convertedReceipts = receipts.map(receipt => ({
      ...receipt,
      created_at: receipt.created_at // The date is already in ISO format
    }));

    let groupedData = [];

    switch (timeRange) {
      case "day":
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
      default:
        groupedData = groupByDayOfWeek(convertedReceipts);
    }

    return groupedData;
  };

  const groupByHour = (receipts) => {
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
      const hour = getHours(parseISO(receipt.created_at));
      hourlyData[hour].revenue += receipt.total || 0;
      hourlyData[hour].count += 1;
    });

    return hourlyData;
  };

  const groupByDayOfWeek = (receipts) => {
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      name: i,
      revenue: 0,
      count: 0
    }));

    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const thisWeekReceipts = receipts.filter(receipt => {
      const receiptDate = parseISO(receipt.created_at);
      return isWithinInterval(receiptDate, {
        start: weekStart,
        end: weekEnd
      });
    });

    thisWeekReceipts.forEach(receipt => {
      const day = getDay(parseISO(receipt.created_at));
      dailyData[day].revenue += receipt.total || 0;
      dailyData[day].count += 1;
    });

    return dailyData;
  };

  const groupByWeekOfMonth = (receipts) => {
    const weeklyData = Array.from({ length: 5 }, (_, i) => ({
      name: i + 1,
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
      const dayOfMonth = receiptDate.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      if (weekNumber >= 1 && weekNumber <= 5) {
        weeklyData[weekNumber - 1].revenue += receipt.total || 0;
        weeklyData[weekNumber - 1].count += 1;
      }
    });

    return weeklyData;
  };

  const groupByMonth = (receipts) => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: i + 1,
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
      const month = getMonth(parseISO(receipt.created_at));
      monthlyData[month].revenue += receipt.total || 0;
      monthlyData[month].count += 1;
    });

    return monthlyData;
  };

  return (
    <Card className="col-span-3 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title || "Revenue Trend"}</CardTitle>
          <TimeRangeSelector 
            value={selectedTimeRange as TimeRange} 
            onChange={(range) => setSelectedTimeRange(range as "day" | "week" | "month" | "year")} 
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
            timeUnit={selectedTimeRange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
