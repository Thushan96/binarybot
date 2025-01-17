import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { subscribeToMarketData, unsubscribeFromMarketData } from "../../utils/websocket";

ChartJS.register(...registerables);

const LiveChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const chartRef = useRef<any>(null);  // Reference to the chart instance
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: `${symbol} Price`,
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  });

  // Function to update the chart with new tick data
  const updateChart = (tick: any) => {
    setChartData((prevData: any) => {
      const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
      const newData = [...prevData.datasets[0].data, tick.quote];

      // Limit the number of points on the chart to prevent overloading the view
      if (newLabels.length > 20) {
        newLabels.shift();
        newData.shift();
      }

      return {
        labels: newLabels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: newData,
          },
        ],
      };
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only run the code in the browser
      subscribeToMarketData(symbol, updateChart);

      // Cleanup function to unsubscribe when the component is unmounted
      return () => {
        unsubscribeFromMarketData(symbol);
      };
    }
  }, [symbol]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line ref={chartRef} data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default LiveChart;
