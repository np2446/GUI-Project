/**
 * FundDetails Component
 * 
 * Displays detailed breakdown of a selected fund's assets in a tabular format.
 * Shows each asset with its Market Value (MV) and Equity allocation, along with
 * a totals row that summarizes the fund's overall valuation.
 * 
 * @param {Object[]} data - Array of asset objects belonging to the selected fund
 * @param {string} fundName - Name of the selected fund to display
 */
import React from 'react';

const FundDetails = ({ data, fundName }) => {
  // Return null if we don't have the required data to render this component
  if (!data || !data.length || !fundName) {
    return null;
  }

  // Calculate total Market Value and Equity across all assets in the fund
  // These values will be displayed in the table's footer row
  const totalMV = data.reduce((sum, item) => sum + (item.MV || 0), 0);
  const totalEquity = data.reduce((sum, item) => sum + (item.Equity || 0), 0);

  return (
    <div className="fund-details">
      {/* Fund title header with fund name and total NAV */}
      <h3 className="fund-details-title">
        Fund {fundName} (${totalMV.toFixed(1)}MM NAV)
      </h3>
      
      {/* Table displaying asset details */}
      <table className="detail-table">
        <thead>
          <tr className="table-header">
            {/* Column headers with alignment styles */}
            <th style={{ textAlign: 'left', width: '40%' }}>Asset</th>
            <th style={{ textAlign: 'right', width: '30%' }}>MV</th>
            <th style={{ textAlign: 'right', width: '30%' }}>Equity</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through each asset to create table rows */}
          {data.map((item, index) => (
            <tr key={index} className="table-row">
              <td style={{ textAlign: 'left' }}>{item.Asset}</td>
              <td style={{ textAlign: 'right' }}>${item.MV.toFixed(2)}MM</td>
              <td style={{ textAlign: 'right' }}>${item.Equity.toFixed(2)}MM</td>
            </tr>
          ))}
          {/* Summary row with fund totals */}
          <tr className="table-row total-row">
            <td style={{ textAlign: 'left' }}>Total</td>
            <td style={{ textAlign: 'right' }}>${totalMV.toFixed(2)}MM</td>
            <td style={{ textAlign: 'right' }}>${totalEquity.toFixed(2)}MM</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FundDetails; 