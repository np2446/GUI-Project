/**
 * Data Loading Utilities
 * 
 * This module provides functions for loading, parsing, and transforming financial 
 * data from Excel files for the Fund Dashboard application.
 */
import { read, utils } from 'xlsx';

/**
 * Load and parse an Excel file containing fund data
 * 
 * Fetches an Excel file from the specified path, converts it to a workbook,
 * and extracts the data from the first sheet as a JSON array.
 * 
 * @param {string} filePath - Path to the Excel file (relative to public directory)
 * @returns {Promise<Array<Object>>} - Promise that resolves to an array of data objects
 * @throws {Error} If the file cannot be fetched or parsed correctly
 */
export const loadExcelData = async (filePath) => {
  try {
    // Fetch the file as an ArrayBuffer
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    // Parse the Excel file using xlsx library
    const workbook = read(arrayBuffer);
    
    // Assume the first sheet contains our data
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel file contains no sheets');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert worksheet to JSON array with headers
    const data = utils.sheet_to_json(worksheet);
    
    console.log('Excel data loaded successfully:', data.length, 'rows');
    return data;
  } catch (error) {
    console.error('Error loading Excel data:', error);
    throw new Error(`Failed to load Excel data: ${error.message}`);
  }
};

/**
 * Calculate the total Assets Under Management from fund data
 * 
 * Sums the Market Value (MV) field across all data entries to determine
 * the total AUM value in millions.
 * 
 * @param {Array<Object>} data - The fund data array
 * @returns {number} - The total AUM in millions
 */
export const calculateTotalAUM = (data) => {
  if (!data || !data.length) return 0;
  return data.reduce((sum, item) => sum + (item.MV || 0), 0);
};

/**
 * Group data by a specific field
 * 
 * Creates an object where keys are unique values of the specified field,
 * and values are arrays of data entries matching each key.
 * 
 * @param {Array<Object>} data - The data array to group
 * @param {string} field - The field name to group by
 * @returns {Object} - Object with groups as keys and arrays as values
 * @example
 * // Group funds by fund type
 * const fundsByType = groupDataByField(data, 'FundType');
 * // Result: { 'Equity': [...], 'Fixed Income': [...], ... }
 */
export const groupDataByField = (data, field) => {
  if (!data || !data.length) return {};
  
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Aggregate data by a field and sum a specified value field
 * 
 * Groups data by the specified field and calculates the sum of another field
 * for each group. Returns an array of objects containing the group key and sum.
 * 
 * @param {Array<Object>} data - The data array to aggregate
 * @param {string} groupField - Field name to group by
 * @param {string} valueField - Field name to sum (defaults to 'MV')
 * @returns {Array<Object>} - Array of aggregated data objects
 * @example
 * // Sum Market Value by Fund Type
 * const aumByFundType = aggregateByField(data, 'FundType', 'MV');
 * // Result: [{ FundType: 'Equity', MV: 12.5 }, { FundType: 'Fixed Income', MV: 7.3 }, ...]
 */
export const aggregateByField = (data, groupField, valueField = 'MV') => {
  if (!data || !data.length) return [];
  
  // First group the data by the specified field
  const groups = groupDataByField(data, groupField);
  
  // Then compute the sum for each group
  return Object.entries(groups).map(([key, items]) => ({
    [groupField]: key,
    [valueField]: items.reduce((sum, item) => sum + (item[valueField] || 0), 0),
    // Include count of items in each group to aid in analysis
    count: items.length
  }));
}; 