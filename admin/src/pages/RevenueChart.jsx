import React, { useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { AuthDataContext } from "../context/AuthContext";

// ✅ Import Chart.js and required components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = () => {
  const [chartData, setChartData] = useState(null);
  const { baseUrl } = useContext(AuthDataContext);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get(baseUrl + "/api/v1/admindata/revenue", {
          withCredentials: true,
        });

        const data = res.data.data;

        setChartData({
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: "Revenue (₹)",
              data: data.map((d) => d.revenue),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching revenue:", err);
      }
    };

    fetchRevenue();
  }, [baseUrl]);

  if (!chartData) return <p className="text-center">Loading chart...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Revenue by Month (Paid Orders Only)" },
          },
        }}
      />
    </div>
  );
};

export default RevenueChart;
