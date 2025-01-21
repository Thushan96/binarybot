// declarations.d.ts or your custom .d.ts file

declare module '@canvasjs/react-stockcharts' {
    const CanvasJSStockChart: any;
    export { CanvasJSStockChart };
  }
  declare module '@deriv/deriv-chart' {
    export const SmartChart: any;
    export const ChartMode: any; // Adjust the export based on actual structure
    export const ToolbarWidget: any; // Adjust the export based on actual structure
  }

  declare module 'is-in-browser' {
    export const isBrowser: boolean;
  }
   