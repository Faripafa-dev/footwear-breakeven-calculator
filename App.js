import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function App() {
  const [inputs, setInputs] = useState({
    fixedCosts: 10000,
    toolingCosts: 5000,
    variableCosts: 20,
    sellingPrice: 50,
    initialSales: 300,
    year1Growth: 10,
    year2Growth: 15,
    year3Growth: 20
  });

  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculate = () => {
    setError('');

    const { fixedCosts, toolingCosts, variableCosts, sellingPrice, initialSales, year1Growth, year2Growth, year3Growth } = inputs;

    if (sellingPrice <= 0) {
      setError('Selling price must be greater than zero.');
      return;
    }

    if (sellingPrice <= variableCosts) {
      setError('Selling price must be greater than variable costs.');
      return;
    }

    const contributionMargin = sellingPrice - variableCosts;
    const breakEvenUnits = (fixedCosts + toolingCosts) / contributionMargin;
    const breakEvenRevenue = breakEvenUnits * sellingPrice;
    const contributionMarginRatio = (contributionMargin / sellingPrice) * 100;

    const currentRevenue = initialSales * sellingPrice;
    const currentProfit = currentRevenue - fixedCosts - toolingCosts - (initialSales * variableCosts);
    const currentMargin = (currentProfit / currentRevenue) * 100;

    const year1Sales = initialSales * (1 + year1Growth / 100);
    const year2Sales = year1Sales * (1 + year2Growth / 100);
    const year3Sales = year2Sales * (1 + year3Growth / 100);

    const calcYearMetrics = (sales) => {
      const revenue = sales * sellingPrice;
      const profit = revenue - fixedCosts - toolingCosts - (sales * variableCosts);
      const margin = (profit / revenue) * 100;
      return { sales, revenue, profit, margin };
    };

    setResults({
      breakEven: { units: breakEvenUnits, revenue: breakEvenRevenue },
      contributionMargin: { perUnit: contributionMargin, ratio: contributionMarginRatio },
      current: { sales: initialSales, revenue: currentRevenue, profit: currentProfit, margin: currentMargin },
      year1: calcYearMetrics(year1Sales),
      year2: calcYearMetrics(year2Sales),
      year3: calcYearMetrics(year3Sales)
    });
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat().format(Math.round(value));
  const formatPercent = (value) => value.toFixed(2) + '%';

  const getBreakEvenChartData = () => {
    if (!results) return [];
    const maxUnits = Math.max(results.breakEven.units * 2, 1000);
    const data = [];
    for (let i = 0; i <= 10; i++) {
      const units = (maxUnits / 10) * i;
      data.push({
        units: Math.round(units),
        revenue: units * inputs.sellingPrice,
        costs: inputs.fixedCosts + inputs.toolingCosts + (units * inputs.variableCosts)
      });
    }
    return data;
  };

  const getSalesProjectionData = () => {
    if (!results) return [];
    return [
      { period: 'Current', sales: results.current.sales },
      { period: 'Year 1', sales: results.year1.sales },
      { period: 'Year 2', sales: results.year2.sales },
      { period: 'Year 3', sales: results.year3.sales }
    ];
  };

  const getProfitProjectionData = () => {
    if (!results) return [];
    return [
      { period: 'Current', profit: results.current.profit },
      { period: 'Year 1', profit: results.year1.profit },
      { period: 'Year 2', profit: results.year2.profit },
      { period: 'Year 3', profit: results.year3.profit }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-slate-700 text-white p-6 rounded-lg mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Footwear Break-Even Calculator</h1>
          <p className="text-slate-200">Calculate your break-even point and 3-year sales projections</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b-2 border-blue-500">Input Data</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Fixed Costs (Monthly)</h3>
                <div className="flex items-center gap-3">
                  <label className="flex-1">Fixed Costs ($):</label>
                  <input type="number" name="fixedCosts" value={inputs.fixedCosts} onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.01" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Tooling Costs (One-time)</h3>
                <div className="flex items-center gap-3">
                  <label className="flex-1">Tooling Costs ($):</label>
                  <input type="number" name="toolingCosts" value={inputs.toolingCosts} onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.01" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Variable Costs (Per Unit)</h3>
                <div className="flex items-center gap-3">
                  <label className="flex-1">Variable Costs ($):</label>
                  <input type="number" name="variableCosts" value={inputs.variableCosts} onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.01" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                <div className="flex items-center gap-3">
                  <label className="flex-1">Selling Price ($):</label>
                  <input type="number" name="sellingPrice" value={inputs.sellingPrice} onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.01" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Sales</h3>
                <div className="flex items-center gap-3">
                  <label className="flex-1">Initial Monthly Sales (Units):</label>
                  <input type="number" name="initialSales" value={inputs.initialSales} onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded" step="1" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Growth Projections (%)</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1">Year 1 Growth Rate:</label>
                    <input type="number" name="year1Growth" value={inputs.year1Growth} onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">Year 2 Growth Rate:</label>
                    <input type="number" name="year2Growth" value={inputs.year2Growth} onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">Year 3 Growth Rate:</label>
                    <input type="number" name="year3Growth" value={inputs.year3Growth} onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded" step="0.1" />
                  </div>
                </div>
              </div>

              <button onClick={calculate} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
                Calculate
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4 pb-2 border-b-2 border-blue-500">Results</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!results && !error && (
              <p className="text-gray-500 text-center py-8">Enter your data and click Calculate to see results</p>
            )}

            {results && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Break-Even Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Break-Even Point (Units):</span>
                      <span className="font-semibold text-blue-600">{formatNumber(results.breakEven.units)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break-Even Revenue ($):</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(results.breakEven.revenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Contribution Margin</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Per Unit ($):</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(results.contributionMargin.perUnit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ratio (%):</span>
                      <span className="font-semibold text-blue-600">{formatPercent(results.contributionMargin.ratio)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold mb-3">Current Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Sales (Units):</span>
                      <span className="font-semibold text-blue-600">{formatNumber(results.current.sales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Revenue ($):</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(results.current.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Profit/Loss ($):</span>
                      <span className={`font-semibold ${results.current.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(results.current.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin (%):</span>
                      <span className="font-semibold text-blue-600">{formatPercent(results.current.margin)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3-Year Projections</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Year</th>
                          <th className="px-3 py-2 text-left">Sales</th>
                          <th className="px-3 py-2 text-left">Revenue</th>
                          <th className="px-3 py-2 text-left">Profit</th>
                          <th className="px-3 py-2 text-left">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Year 1', data: results.year1 },
                          { label: 'Year 2', data: results.year2 },
                          { label: 'Year 3', data: results.year3 }
                        ].map(({ label, data }) => (
                          <tr key={label} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2">{label}</td>
                            <td className="px-3 py-2">{formatNumber(data.sales)}</td>
                            <td className="px-3 py-2">{formatCurrency(data.revenue)}</td>
                            <td className={`px-3 py-2 font-semibold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(data.profit)}
                            </td>
                            <td className="px-3 py-2">{formatPercent(data.margin)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {results && (
          <div className="mt-6 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Break-Even Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getBreakEvenChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="units" label={{ value: 'Units Sold', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2ecc71" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="costs" stroke="#e74c3c" strokeWidth={2} name="Total Costs" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">3-Year Sales Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getSalesProjectionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                    <Bar dataKey="sales" fill="#3498db" name="Monthly Sales (Units)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">3-Year Profit Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getProfitProjectionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis label={{ value: 'Profit ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="profit" fill="#2ecc71" name="Monthly Profit ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}