import React, { useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const RevenueChart = ({ height = 250 }) => {
  const [chartData, setChartData] = useState(null);
  const { baseUrl } = useContext(AuthDataContext);

  useEffect(() => {
    const fetchRevenue = async () => {
      if (!baseUrl) return;
      try {
        const res = await axios.get(baseUrl + "/api/v1/admindata/revenue", {
          withCredentials: true,
        });

        const data = res.data.data || [];

        setChartData({
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: "Revenue",
              data: data.map((d) => d.revenue),
              backgroundColor: "rgba(250, 204, 21, 0.8)",
              borderColor: "rgba(234, 179, 8, 1)",
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching revenue:", err);
      }
    };

    fetchRevenue();
  }, [baseUrl]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1f2937",
              titleColor: "#fff",
              bodyColor: "#fff",
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: (context) => `₹${context.raw?.toLocaleString() || 0}`
              }
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#6b7280", font: { size: 11 } },
            },
            y: {
              grid: { color: "#f3f4f6" },
              ticks: {
                color: "#6b7280",
                font: { size: 11 },
                callback: (value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`
              },
            },
          },
        }}
      />
    </div>
  );
};

export default RevenueChart;
