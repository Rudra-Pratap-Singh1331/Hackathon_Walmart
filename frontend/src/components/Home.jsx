// frontend/Home.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Mic } from "lucide-react";

let recognitionInstance = null;
let isListening = false;

export default function Home() {
  const [totals, setTotals] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [range, setRange] = useState(7);
  const [summary, setSummary] = useState("Say 'Hello Gemini' to begin...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [totalsRes, topRes, dailyRes, stockRes] = await Promise.all([
          fetch("http://localhost:5000/api/dashboard/totals"),
          fetch("http://localhost:5000/api/dashboard/top-products"),
          fetch(`http://localhost:5000/api/dashboard/daily-sales?days=${range}`),
          fetch("http://localhost:5000/api/products/low-stock"),
        ]);

        const [totals, top, daily, stock] = await Promise.all([
          totalsRes.json(),
          topRes.json(),
          dailyRes.json(),
          stockRes.json(),
        ]);

  const getPastNDates = (n) => {
  const dates = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const iso = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    dates.push({ iso, label });
  }

  return dates;
};

const formattedSales = getPastNDates(range).map(({ iso, label }) => {
  const match = daily.find((d) => d._id === iso);
  return {
    name: label,
    sales: match ? match.dailyRevenue : 0,
  };
});


        setTotals(totals);
        setTopProducts(top);
        setDailySales(formattedSales);
        setLowStock(stock);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, [range]);

  const handleVoiceCommand = () => {
    if (isListening) return;
    isListening = true;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionInstance = recognition;

    const speakText = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      return new Promise((resolve) => (utterance.onend = resolve));
    };

    const startListening = () => {
      recognition.start();
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Heard:", transcript);
      setSummary("Processing...");

      if (transcript.includes("hello gemini")) {
        await speakText("Hello sir, how can I assist you?");
        startListening();
      } else {
        try {
    
          const dashboardData = {
            totals,
            topProducts,
            lowStock,
            dailySales,
          };

          const res = await fetch("http://localhost:5000/api/gemini/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: transcript,
              dashboardData,
            }),
          });

          const data = await res.json();
          setSummary(data.output);
          await speakText(data.output);
          startListening();
        } catch (err) {
          console.error("AI error:", err);
          setSummary("There was an error processing your request.");
          await speakText("There was an error processing your request.");
        }
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      startListening();
    };

    startListening();
  };

  const stopAI = () => {
    if (recognitionInstance) {
      recognitionInstance.abort();
      recognitionInstance = null;
    }
    window.speechSynthesis.cancel();
    isListening = false;
    console.log("AI listening stopped.");
  };
  console.log(topProducts)
  return (
    <div className="p-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Sales */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Total Sales (This Week)</h2>
        <p className="text-3xl font-bold text-[#0071dc]">₹{totals.totalRevenue || 0}</p>
      </div>

      {/* Revenue & Profit */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Revenue & Profit</h2>
        <p className="text-lg text-[#0071dc]">Revenue: ₹{totals.totalRevenue || 0}</p>
        <p className="text-lg text-[#0071dc]">Profit: ₹{totals.totalProfit || 0}</p>
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Low Stock Alerts</h2>
        {lowStock.length===0? <p className="text-[#0071dc]">Nothing to restock!!</p>:
        <ul className="list-disc pl-4 text-sm text-[#0071dc]">
          {lowStock.map((item) => (
            <li key={item._id}>{item.name} ({item.quantity} left)</li>
          ))}
        </ul>}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow p-4 col-span-1 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Top 5 Selling Products</h2>
        <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
          {topProducts.map((product, index) => (
            <li
              key={index}
              className="flex justify-between border-b py-1 border-gray-200"
            >
              <span>{product._id}</span>
              <span className="text-[#0071dc] font-semibold">
                {product.totalSold} units
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Summary */}
   <div className="bg-white rounded-2xl shadow p-4">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-xl font-semibold">Talk with AI</h2>
    <div className="flex items-center gap-2">
      <Mic
        className="h-5 w-5 text-[#0071dc] cursor-pointer"
        onClick={handleVoiceCommand}
        title="Click to speak"
      />
      <button
        onClick={stopAI}
        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        title="Stop AI"
      >
        Stop AI
      </button>
    </div>
  </div>

  <div
    className="text-sm text-gray-700 leading-relaxed overflow-y-auto pr-2"
    style={{
      maxHeight: "160px", // 10rem
      scrollbarWidth: "thin",
    }}
  >{summary === "Processing..." ? (
    <div className="flex items-center gap-2 text-gray-500">
      <svg
        className="animate-spin h-4 w-4 text-[#0071dc]"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>Processing...</span>
    </div>
  ) : (
    <p className="transition duration-100 ease-in whitespace-pre-line">{summary}</p>
  )}
  </div>
</div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow p-4 col-span-1 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sales Trends</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setRange(7)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                range === 7
                  ? "bg-[#0071dc] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setRange(30)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                range === 30
                  ? "bg-[#0071dc] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

      <ResponsiveContainer width="100%" height={260}>
  <BarChart
    data={dailySales}
    margin={{ top: 10, right: 30, bottom: 40 }}
    barCategoryGap={10}  // 🎯 Make category spacing tighter (was "5%")
    barGap={0}            // 🎯 Remove gap between bars of same group
  >
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" />
    
    <XAxis
      dataKey="name"
      tick={{ fontSize: 12, fill: "#000000" }}
      angle={-25}
      textAnchor="end"
      interval={0}     // 🔥 Show all dates, even if very close
    />
    
    <YAxis
      tick={{ fontSize: 12, fill: "#000000" }}
      tickFormatter={(value) => `₹${value}`}
    />
    
    <Tooltip
      formatter={(value) => `₹${value}`}
      labelStyle={{ color: "#000000", fontWeight: 500 }}
      contentStyle={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
    />
    
    <Bar
      dataKey="sales"
      fill="#0071dc"
      radius={[6, 6, 0, 0]}
      barSize={30}      // ✅ Tweak this size as per width
    />
  </BarChart>
</ResponsiveContainer>


      </div>
    </div>
  );
}
