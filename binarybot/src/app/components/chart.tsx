import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { subscribeToMarketData, unsubscribeFromMarketData } from "../../utils/websocket";

ChartJS.register(...registerables);

interface LiveChartProps {
  symbol: string;
  tradePlaced: boolean; // Boolean flag indicating a trade was placed
}

const LiveChart: React.FC<LiveChartProps> = ({ symbol, tradePlaced }) => {
  const chartRef = useRef<any>(null); // Reference to the chart instance
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: `${symbol} Price`,
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        pointBackgroundColor: [],
        pointRadius: [],
        fill: false,
      },
    ],
  });

  const [latestTick, setLatestTick] = useState<any>(null);

  // Function to update the chart with new tick data
  const updateChart = (tick: any) => {
    setLatestTick(tick); // Store the latest tick for reference
    setChartData((prevData: any) => {
      const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
      const newData = [...prevData.datasets[0].data, tick.quote];
      const newPointColors = [...prevData.datasets[0].pointBackgroundColor, "rgba(75, 192, 192, 1)"];
      const newPointSizes = [...prevData.datasets[0].pointRadius, 3];

      // Limit the number of points on the chart to prevent overloading the view
      if (newLabels.length > 20) {
        newLabels.shift();
        newData.shift();
        newPointColors.shift();
        newPointSizes.shift();
      }

      return {
        labels: newLabels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: newData,
            pointBackgroundColor: newPointColors,
            pointRadius: newPointSizes,
          },
        ],
      };
    });
  };

  // Function to mark the trade on the chart
  const addTradeMarker = () => {
    if (latestTick) {
      setChartData((prevData: any) => {
        const updatedColors = [...prevData.datasets[0].pointBackgroundColor];
        const updatedSizes = [...prevData.datasets[0].pointRadius];
        updatedColors[updatedColors.length - 1] = "red"; // Change the last point to red
        updatedSizes[updatedSizes.length - 1] = 6; // Enlarge the last point

        return {
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              pointBackgroundColor: updatedColors,
              pointRadius: updatedSizes,
            },
          ],
        };
      });
    }
  };

  useEffect(() => {
    // Subscribe to market data for the symbol
    subscribeToMarketData(symbol, updateChart);

    // Cleanup function to unsubscribe when the component is unmounted
    return () => {
      unsubscribeFromMarketData(symbol);
    };
  }, [symbol]);

  // Listen for tradePlaced flag to trigger marker addition
  useEffect(() => {
    if (tradePlaced) {
      addTradeMarker();
    }
  }, [tradePlaced]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line ref={chartRef} data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default LiveChart;
