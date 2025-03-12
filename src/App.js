/**
 * Fund Management Dashboard Application
 * 
 * Main application component that orchestrates the fund dashboard's functionality.
 * Manages data loading, state management, and visualization components.
 * Provides interactive drill-down from fund types to individual funds and assets.
 */
import React, { useState, useEffect } from 'react';
import PieChart from './components/PieChart';
import FundDetails from './components/FundDetails';
import { loadExcelData, calculateTotalAUM, aggregateByField } from './utils/dataLoader';
import './index.css';

/**
 * Main App Component
 * 
 * Controls the application flow, data fetching, and user interaction.
 * Maintains state for selected funds and renders appropriate visualizations.
 */
const App = () => {
  /**
   * Application State Management
   */
  // Primary data store for all fund information loaded from Excel
  const [fundData, setFundData] = useState([]);
  // Loading state to display appropriate UI during data fetch
  const [loading, setLoading] = useState(true);
  // Error state to handle and display data loading failures
  const [error, setError] = useState(null);
  // Track the currently selected fund type (main pie chart selection)
  const [selectedFundType, setSelectedFundType] = useState(null);
  // Track the currently selected sub-fund (second-level drill down)
  const [selectedSubFund, setSelectedSubFund] = useState(null);
  
  /**
   * Derived Data Calculations
   * These values are computed from the primary state and don't need their own state variables
   */
  // Calculate the total Assets Under Management across all funds
  const totalAUM = calculateTotalAUM(fundData);
  
  // Aggregate fund data by fund type for the main pie chart
  const fundTypeData = aggregateByField(fundData, 'FundType');
  
  // Filter and aggregate data for the selected fund type (for sub-fund breakdown chart)
  const subFundData = selectedFundType 
    ? aggregateByField(fundData.filter(item => item.FundType === selectedFundType), 'Fund') 
    : [];
  
  // Filter data for the selected sub-fund (for detailed asset breakdown table)
  const fundDetailsData = selectedSubFund 
    ? fundData.filter(item => item.Fund === selectedSubFund)
    : [];

  /**
   * Data Loading Effect
   * 
   * Executes once on component mount to fetch the Excel data
   * Updates application state based on fetch results
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Excel file from the public/data folder
        const data = await loadExcelData('/data/DummyDataSet.xlsx');
        setFundData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(`Failed to load data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Event Handlers
   */
  // Handle selection of a fund type from the main pie chart
  const handleFundTypeSelect = (fundType) => {
    setSelectedFundType(fundType);
    // Reset sub-fund selection when changing fund type to maintain data hierarchy
    setSelectedSubFund(null);
  };

  // Handle selection of a specific sub-fund from the secondary pie chart
  const handleSubFundSelect = (subFund) => {
    setSelectedSubFund(subFund);
  };

  /**
   * Conditional Rendering - Loading State
   * 
   * Displays a loading message while data is being fetched
   */
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading dashboard data...</h2>
        <p>Please wait while we load the fund data.</p>
      </div>
    );
  }

  /**
   * Conditional Rendering - Error State
   * 
   * Displays an error message if data loading fails
   */
  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <p>Please check that the Excel file exists at public/data/DummyDataSet.xlsx</p>
      </div>
    );
  }

  /**
   * Main Dashboard Rendering
   * 
   * Renders the complete dashboard UI with charts and tables based on current selections
   */
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px' }}>
      {/* Dashboard Header */}
      <div className="header">
        <h1>Fund Management Dashboard</h1>
      </div>
      
      {/* Main Content Container */}
      <div className="container">
        {/* Charts Row - Contains the main and sub-fund pie charts */}
        <div className="chart-row">
          {/* Main Pie Chart - Always visible, shows distribution by fund type */}
          <div className="chart-column">
            <div className="chart-header">
              <h3 className="chart-title">Fund Type Distribution</h3>
            </div>
            
            <PieChart
              data={fundTypeData}
              labelField="FundType"
              valueField="MV"
              selectedItem={selectedFundType}
              onItemSelect={handleFundTypeSelect}
              title={`Total AUM: $${totalAUM.toFixed(1)}MM`}
            />
          </div>
          
          {/* Sub-fund Pie Chart - Only visible when a fund type is selected */}
          {selectedFundType && (
            <div className="chart-column">
              <div className="chart-header">
                <h3 className="chart-title">Sub-Fund Breakdown</h3>
              </div>
              
              <PieChart
                data={subFundData}
                labelField="Fund"
                valueField="MV"
                title={`$${subFundData.reduce((sum, item) => sum + item.MV, 0).toFixed(1)}MM ${selectedFundType} NAV`}
                selectedItem={selectedSubFund}
                onItemSelect={handleSubFundSelect}
                colorOffset={3} // Use different color palette to distinguish from main chart
              />
            </div>
          )}
        </div>
        
        {/* Fund Details Section - Only visible when a specific sub-fund is selected */}
        {selectedSubFund && (
          <FundDetails
            data={fundDetailsData}
            fundName={selectedSubFund}
          />
        )}
      </div>
      
      {/* Dashboard Footer */}
      <div className="footer">
        <p>Investment Dashboard by Noah Perelmuter</p>
      </div>
    </div>
  );
};

export default App; 