import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "../../css/admin-order.css";

// Đăng ký các thành phần bắt buộc của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const RevenueTab = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthA, setMonthA] = useState(1);
  const [monthB, setMonthB] = useState(2);

  // Khởi tạo state với cấu trúc chuẩn để tránh lỗi undefined khi render
  const [stats, setStats] = useState({
    topProducts: [],
    topCustomers: [],
    dataA: [], // Dữ liệu doanh thu tháng A
    dataB: [], // Dữ liệu doanh thu tháng B
  });

  const [loading, setLoading] = useState(false);

  // Tạo danh sách 10 năm lùi về trước
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);

  // useEffect gọi API lấy dữ liệu thực từ Backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Gửi yêu cầu lấy thống kê dựa trên năm và 2 tháng cần so sánh
        const res = await axios.get("http://localhost:3000/api/orders/revenue-stats", {
          params: { 
            year: selectedYear,
            monthA: monthA,
            monthB: monthB
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Cập nhật state với dữ liệu thực từ Backend
        setStats({
          topProducts: res.data.topProducts || [],
          topCustomers: res.data.topCustomers || [],
          dataA: res.data.dataA || [],
          dataB: res.data.dataB || []
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh số:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, monthA, monthB]);

  // Hàm kiểm tra xem tháng đó có dữ liệu để vẽ biểu đồ không
  const hasData = (dataArray) => {
    return dataArray && dataArray.length > 0 && dataArray.some(val => val > 0);
  };

  // Cấu hình dữ liệu cho biểu đồ tròn
  const chartData = (monthLabel, dataArray) => ({
    labels: stats.topProducts.slice(0, 4).map(p => p.name) || ["Trống"], // Lấy tên 4 SP đầu
    datasets: [{
      label: `Doanh thu ${monthLabel}`,
      data: dataArray,
      backgroundColor: ["#000856", "#01cf5a", "#ff4d4f", "#f7ff13"],
      hoverOffset: 4
    }]
  });

  // Các màu dùng cho legend/tên sản phẩm dưới biểu đồ
  const legendColors = ["#000856", "#01cf5a", "#ff4d4f", "#f7ff13"];

  // Options để chỉnh legend hiển thị ở lề trái và tooltip hiển thị đầy đủ tên
  const chartOptions = {
    plugins: {
      // Tắt legend mặc định (đã hiển thị danh sách sản phẩm tùy chỉnh phía dưới)
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="revenue-content" style={{ width: "80%", margin: "0 auto" }}>
      <h1>Xem doanh số bán hàng</h1>

      {/* Bộ lọc */}
      <div className="filter-row">
        <div className="compare-selects">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        </div>

        <div className="compare-selects">
          <label>Biểu đồ A: </label>
          <select value={monthA} onChange={(e) => setMonthA(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>

          <label>Biểu đồ B: </label>
          <select value={monthB} onChange={(e) => setMonthB(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', margin: '50px'}}>Đang tải dữ liệu...</p>
      ) : (
        <>
          {/* Biểu đồ so sánh dạng Tròn */}
          <div className="charts-flex" style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
            <div className="chart-item" style={{ flex: 1, textAlign: 'center' }}>
              <h3>Biểu đồ Tháng {monthA}</h3>
              {hasData(stats.dataA) ? (
                <div style={{ width: '300px', height: '320px', margin: '0 auto' }}>
                  <Pie data={chartData(`Tháng ${monthA}`, stats.dataA)} options={chartOptions} />

                  {/* Hiển thị tên sản phẩm dưới biểu đồ với màu tương ứng */}
                  <div style={{ marginTop: 12, textAlign: 'left' }}>
                    {stats.topProducts.slice(0,4).map((p, idx) => (
                      <div key={p._id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }} title={p.name}>
                        <div style={{ width: 12, height: 12, background: legendColors[idx] || '#ddd', borderRadius: 2 }} />
                        <div style={{ fontSize: 12, maxWidth: 240, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-box">Không có dữ liệu</div>
              )}
            </div>

            <div className="chart-item" style={{ flex: 1, textAlign: 'center' }}>
              <h3>Biểu đồ Tháng {monthB}</h3>
              {hasData(stats.dataB) ? (
                <div style={{ width: '300px', height: '320px', margin: '0 auto' }}>
                  <Pie data={chartData(`Tháng ${monthB}`, stats.dataB)} options={chartOptions} />

                  {/* Hiển thị tên sản phẩm dưới biểu đồ với màu tương ứng */}
                  <div style={{ marginTop: 12, textAlign: 'left' }}>
                    {stats.topProducts.slice(0,4).map((p, idx) => (
                      <div key={p._id || idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }} title={p.name}>
                        <div style={{ width: 12, height: 12, background: legendColors[idx] || '#ddd', borderRadius: 2 }} />
                        <div style={{ fontSize: 12, maxWidth: 240, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-box">Không có dữ liệu</div>
              )}
            </div>
          </div>

          {/* Bảng xếp hạng Top 10 */}
          <div className="top-rankings" style={{ display: "flex", gap: "40px", marginTop: "50px" }}>
            <div className="ranking-col" style={{ flex: 1 }}>
              <h3>Top 10 sản phẩm bán chạy nhất</h3>
              <table className="stats-table">
                <thead>
                  <tr><th>STT</th><th>Tên sản phẩm</th><th>Số lượng bán</th></tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{p.name}</td><td>{p.totalQty}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ranking-col" style={{ flex: 1 }}>
              <h3>Top 10 khách hàng mua nhiều nhất</h3>
              <table className="stats-table">
                <thead>
                  <tr><th>STT</th><th>Họ & Tên</th><th>Số lượng mua</th></tr>
                </thead>
                <tbody>
                  {stats.topCustomers.map((c, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{c.fullName}</td><td>{c.totalItems}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueTab;