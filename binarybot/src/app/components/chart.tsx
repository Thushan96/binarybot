import React, { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { subscribeToMarketData, unsubscribeFromMarketData } from "../../utils/websocket";

// Register Chart.js components
ChartJS.register(...registerables);

interface LiveChartProps {
  symbol: string;
  tradePlaced: boolean;
}

const LiveChart: React.FC<LiveChartProps> = ({ symbol, tradePlaced }) => {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: `${symbol} Price`,
        data: [],
        borderColor: "black",
        borderWidth: 1,
        pointBackgroundColor: [],
        pointRadius: [],
        fill: false,
      },
    ],
  });

  const [latestTick, setLatestTick] = useState<any>(null);

  // Update the chart with new data
  const updateChart = (tick: any) => {
    setLatestTick(tick);
    setChartData((prevData: any) => {
      const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
      const newData = [...prevData.datasets[0].data, tick.quote];
      const newPointColors = [...prevData.datasets[0].pointBackgroundColor, "rgba(75, 192, 192, 1)"];
      const newPointSizes = [...prevData.datasets[0].pointRadius, 3];

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

  // Add trade marker on the chart
  const addTradeMarker = () => {
    if (latestTick) {
      setChartData((prevData: any) => {
        const updatedColors = [...prevData.datasets[0].pointBackgroundColor];
        const updatedSizes = [...prevData.datasets[0].pointRadius];
        updatedColors[updatedColors.length - 1] = "blue";
        updatedSizes[updatedSizes.length - 1] = 6;

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

  // Subscribe to market data when the symbol changes
  useEffect(() => {
    subscribeToMarketData(symbol, updateChart);
    return () => {
      unsubscribeFromMarketData(symbol);
    };
  }, [symbol]);

  // Add trade marker when trade is placed
  useEffect(() => {
    if (tradePlaced) {
      addTradeMarker();
    }
  }, [tradePlaced]);

  return (
    <div style={{ position: "relative", width: "100%", height: "50vh" }}>
      <Line ref={chartRef} data={chartData} options={{ responsive: true ,maintainAspectRatio: true }} />
    </div>
  );
};

export default LiveChart;
