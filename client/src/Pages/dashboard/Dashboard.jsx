import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [total, setTotal] = useState(0);
  const [totalMonthCollection, setTotalMonthCollection] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const chartInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Fetch invoice data
  const getData = async () => {
    try {
      const response = await axios.post("https://aimsps-server.vercel.app/api/invoices", {
        email: localStorage.getItem("email"),
      });
      setInvoices(response.data.invoices);
      getOverAllTotal(response.data.invoices);
      getMonthsTotal(response.data.invoices);
      calculateMonthWiseCollection(response.data.invoices);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Calculate total amount from all invoices
  const getOverAllTotal = (invoiceList) => {
    const overallTotal = invoiceList.reduce((acc, curr) => acc + curr.total, 0);
    setTotal(overallTotal);
  };

  // Calculate this month's total
  const getMonthsTotal = (invoiceList) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthTotal = invoiceList
      .filter((invoice) => {
        const invoiceDate = invoice.date.seconds
          ? new Date(invoice.date.seconds * 1000)
          : new Date(invoice.date);
        return (
          invoiceDate.getMonth() === currentMonth &&
          invoiceDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, curr) => acc + curr.total, 0);
    setTotalMonthCollection(monthTotal);
  };

  // Calculate month-wise collection for the chart
  const calculateMonthWiseCollection = (data) => {
    const chartData = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0,
    };

    data.forEach((d) => {
      const invoiceDate = d.date.seconds
        ? new Date(d.date.seconds * 1000)
        : new Date(d.date);
      const month = invoiceDate.toLocaleDateString("default", {
        month: "long",
      });

      if (invoiceDate.getFullYear() === new Date().getFullYear()) {
        chartData[month] += d.total;
      }
    });

    if (Object.values(chartData).some((value) => value > 0)) {
      createChart(chartData);
    }
  };

  // Create chart using chart.js
  const createChart = (chartData) => {
    const ctx = document.getElementById("myChart");
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(chartData),
        datasets: [
          {
            label: "Monthly Collection",
            data: Object.values(chartData),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              font: {
                size: 15 // Increase the font size of the legend
              }
            }
          },
          tooltip: {
            bodyFont: {
              size: 15 // Increase the font size of the tooltip
            },
            titleFont: {
              size: 15 // Increase the font size of the tooltip title
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 14 // Increase the font size for x-axis labels
              }
            }
          },
          y: {
            ticks: {
              font: {
                size: 14 // Increase the font size for y-axis labels
              }
            }
          }
        }
      }
    });
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`; // Format in millions
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`; // Format in thousands
    }
    return value.toLocaleString(); // Default formatting
  };

  // Navigate to the invoice details page
  const handleInvoiceClick = (invoice) => {
    navigate("/invoice-details", { state: invoice });
  };

  // Fetch data when the component mounts
  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="home-container">
      <div className="home-first-row">
        <div className="home-box box-1">
          <h1>Rs. {formatCurrency(total)}</h1>
          <p>Overall Total</p>
        </div>
        <div className="home-box box-2">
          <h1>{invoices.length}</h1>
          <p>Total Invoices</p>
        </div>
        <div className="home-box box-3">
          <h1>Rs. {formatCurrency(totalMonthCollection)}</h1>
          <p>This Month's Collection</p>
        </div>
      </div>

      <div className="chart-box">
        <canvas id="myChart"></canvas>
      </div>

      <div className="home-second-row">
        <div className="recent-invoice-list">
          <h3>Recent Invoice List</h3>
          {/* Table for Recent Invoices */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice No.</th>
                <th>Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(-10).reverse().map((data, index) => {
                const dateObj = data.date.seconds
                  ? new Date(data.date.seconds * 1000)
                  : new Date(data.date);
                return (
                  <tr
                    key={index}
                    onClick={() => handleInvoiceClick(data)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{!isNaN(dateObj) ? dateObj.toLocaleDateString() : "Invalid Date"}</td>
                    <td>{data.invoiceId}</td>
                    <td>{data.to}</td>
                    <td>{formatCurrency(data.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
