import React, { useEffect, useState } from "react";
import CanvasJSReact from "@canvasjs/react-stockcharts";
import { subscribeToMarketData, unsubscribeFromMarketData } from "../../utils/websocket";

const { CanvasJSStockChart } = CanvasJSReact;

interface LiveChartProps {
  symbol: string;
  tradePlaced: boolean;
}

const LiveChart: React.FC<LiveChartProps> = ({ symbol, tradePlaced }) => {
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [tradeMarkers, setTradeMarkers] = useState<any[]>([]);

  // Update the chart with new data
  const updateChart = (tick: any) => {
    setDataPoints((prevPoints) => [
      ...prevPoints,
      { x: new Date(), y: tick.quote }, // Adding new data point
    ]);
  };

  // Add trade marker
  const addTradeMarker = () => {
    if (dataPoints.length > 0) {
      const lastDataPoint = dataPoints[dataPoints.length - 1];
      setTradeMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          x: lastDataPoint.x,
          y: lastDataPoint.y,
          markerType: "circle",
          markerSize: 10,
          markerColor: "blue",
        },
      ]);
    }
  };

  
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

  // Configuration for CanvasJS StockChart
  const options = {
    theme: "light2",
    title: {
      text: `${symbol}`,
    },
    subtitles: [
      {
        text: "Market Data",
      },
    ],
    charts: [
      {
        data: [
          {
            type: "line",
            dataPoints: dataPoints, // Main data series for the line chart
          },
          {
            type: "scatter",
            dataPoints: tradeMarkers,
            markerType: "circle",
            markerSize: 10,
            markerColor: "blue",
            showInLegend: false,
          },
        ],
      },
    ],
    navigator: {
      slider: {
        minimum: new Date(new Date().getTime() - 60000),
      },
    },
    rangeSelector: {
      enabled: false,
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "50vh" }}>
      <CanvasJSStockChart options={options} containerProps={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default LiveChart;
