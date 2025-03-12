/**
 * PieChart Component
 * 
 * A reusable pie chart visualization built on Chart.js and react-chartjs-2.
 * Features interactive segments that can be clicked to drill down into data.
 * Displays data labels, tooltips, and supports highlighting of selected segments.
 */
import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

/**
 * Predefined color palette for chart segments
 * Colors are selected to be visually distinct while maintaining a cohesive look
 */
const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#ef4444', // Red
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#f59e0b'  // Amber
];

/**
 * PieChart Component
 * 
 * @param {Object[]} data - Array of data objects to visualize
 * @param {string} labelField - Property name in data objects to use for segment labels
 * @param {string} valueField - Property name in data objects to use for segment values (defaults to 'MV')
 * @param {string} title - Optional title to display above the chart
 * @param {string} selectedItem - Currently selected segment label (for highlighting)
 * @param {Function} onItemSelect - Callback function when a segment is clicked
 * @param {number} colorOffset - Offset into the color array (useful when rendering multiple charts)
 */
const PieChart = ({ 
  data, 
  labelField, 
  valueField = 'MV', 
  title = null,
  selectedItem = null, 
  onItemSelect,
  colorOffset = 0
}) => {
  // Reference to the chart instance for accessing canvas and event handling
  const chartRef = useRef(null);
  
  /**
   * Effect hook to set up click handling for chart segments
   * Sets up event listeners for interactivity and cleans them up on unmount
   */
  useEffect(() => {
    if (!data || !data.length) return;
    
    let isMounted = true;
    let chartInstance = null;
    let handleClick = null;

    /**
     * Configures click event handler on the chart canvas
     * Enables selecting/deselecting pie segments
     */
    const setupClickHandler = () => {
      if (!isMounted || !chartRef.current) return;
      
      chartInstance = chartRef.current;
      
      if (!chartInstance || !chartInstance.canvas) return;
      
      const labels = data.map(item => item[labelField]);
      
      /**
       * Chart click handler function
       * Identifies the clicked segment and calls onItemSelect with the item label
       * Toggles selection state if clicking already selected item
       */
      handleClick = (event) => {
        if (!chartRef.current) return;
        
        const chart = chartRef.current;
        const activeElements = chart.getElementsAtEventForMode(
          event,
          'nearest',
          { intersect: true },
          false
        );
        
        if (activeElements.length === 0) return;
        
        const { index } = activeElements[0];
        const clickedItem = labels[index];
        
        // Toggle selection - deselect if clicking the already selected item
        if (clickedItem === selectedItem) {
          onItemSelect(null);
        } else {
          onItemSelect(clickedItem);
        }
      };
      
      chartInstance.canvas.addEventListener('click', handleClick);
    };
    
    // Small delay to ensure chart is fully rendered before attaching handlers
    const timer = setTimeout(() => {
      setupClickHandler();
    }, 100);
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (chartInstance && chartInstance.canvas && handleClick) {
        try {
          chartInstance.canvas.removeEventListener('click', handleClick);
        } catch (error) {
          console.warn('Failed to remove chart event listener:', error);
        }
      }
    };
  }, [data, labelField, selectedItem, onItemSelect]);

  // Display loading state if data is not available
  if (!data || !data.length) {
    return <div className="chart-container">Loading data...</div>;
  }
  
  // Extract labels and values from the data using the specified fields
  const labels = data.map(item => item[labelField]);
  const values = data.map(item => item[valueField]);
  
  // Assign colors to chart segments, using the colorOffset to create variation
  // between multiple charts in the same view
  const colors = data.map((_, index) => 
    CHART_COLORS[(index + colorOffset) % CHART_COLORS.length]
  );
  
  // Prepare the data structure required by Chart.js
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: 'white',
        borderWidth: 2,
        // Create an offset effect for the selected segment to highlight it
        offset: labels.map(label => label === selectedItem ? 20 : 0),
      },
    ],
  };
  
  /**
   * Chart.js configuration options
   * Defines appearance, behavior, and formatting of various chart elements
   */
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      // Legend configuration
      legend: {
        position: 'bottom',
        align: 'center',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#4b5563',
          padding: 20,
          usePointStyle: true,
          boxWidth: 10
        }
      },
      // Tooltip configuration with custom label formatting
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percent = ((value / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(1)}MM (${percent}%)`;
          }
        }
      },
      // Data labels configuration (text displayed directly on chart segments)
      datalabels: {
        color: 'white',
        font: {
          weight: 'bold',
          size: 12,
          family: "'Inter', sans-serif",
        },
        // Only show labels for segments that are large enough (>5%)
        formatter: (value, context) => {
          const percent = ((value / values.reduce((a, b) => a + b, 0)) * 100).toFixed(0);
          if (percent < 5) return '';
          return `${context.chart.data.labels[context.dataIndex]}\n${percent}%`;
        },
        textAlign: 'center'
      },
      // Disable the Chart.js built-in title in favor of our custom HTML title
      title: {
        display: false
      }
    },
    // Animation settings for visual appeal
    animation: {
      animateRotate: true,
      animateScale: true
    },
    // Chart padding and layout configuration
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };
  
  // Render the chart with its container and custom title
  return (
    <div className="chart-container">
      {/* Custom HTML title element for consistent display across browsers */}
      {title && (
        <h4 className="chart-internal-title">{title}</h4>
      )}
      
      {/* Fixed height container ensures consistent chart size */}
      <div style={{ height: '380px', position: 'relative' }}>
        <Pie 
          ref={chartRef}
          data={chartData} 
          options={options}
        />
      </div>
    </div>
  );
};

export default PieChart; 