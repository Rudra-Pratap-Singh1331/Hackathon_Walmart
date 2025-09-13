import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
const CustomerNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartId, setCartId] = useState(localStorage.getItem("cartId") || "");

  const recognitionRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const navigate = useNavigate();

  // 🔐 Auto-generate new cartId per user login
  useEffect(() => {
    if (user?._id) {
      const storedCartId = localStorage.getItem("cartId");
      const storedUserId = localStorage.getItem("cartUserId");

      if (!storedCartId || storedUserId !== user._id) {
        const newCartId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        localStorage.setItem("cartId", newCartId);
        localStorage.setItem("cartUserId", user._id);
        setCartId(newCartId);
        console.log("🆕 New cartId created for user:", newCartId);
      } else {
        setCartId(storedCartId);
      }
    }
  }, [user]);

  // 🏆 Loyalty points
  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/loyalty", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log(res.data.loyaltyPoints)
   
      } catch (error) {
        console.error("Failed to fetch loyalty points:", error);
      }
    };
    if (user?.token) fetchLoyalty();
  }, [user]);

  // 🔒 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerSearch = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      stopListening();
    }, 20000);
  };

  const handleVoiceCommand = async (transcript) => {
    const cleaned = transcript.toLowerCase().trim();

    if (cleaned === "go back") {
      window.history.back();
      return;
    }

    const navKeywords = ["navigate to", "open", "go to", "move to"];
    const sections = ["loyalty", "cart", "shoes", "furniture", "mobile", "electronics", "laptop", "home"];

    const matchedSection = sections.find((section) =>
      navKeywords.some((kw) => cleaned.includes(`${kw} ${section}`))
    );

    if (matchedSection) {
      const currentCartId = localStorage.getItem("cartId");
      const path = matchedSection === "cart" ? `/cart/${currentCartId}` : `/${matchedSection}`;
      navigate(path);
      const utter = new SpeechSynthesisUtterance(`Opening ${matchedSection} section`);
      window.speechSynthesis.speak(utter);
      return;
    }

    if (cleaned.startsWith("search") || cleaned.startsWith("find")) {
      const keyword = cleaned.replace(/(search|search for|find|look up)/i, "").trim();
      setSearchQuery(keyword);
      if (searchInputRef.current) searchInputRef.current.value = keyword;
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
      const utter = new SpeechSynthesisUtterance(`Searching for ${keyword}`);
      window.speechSynthesis.speak(utter);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/ai/askassistant", { transcript: cleaned });
      const { response, intent, target } = res.data;

      if (response) {
        const speak = new SpeechSynthesisUtterance(response);
        window.speechSynthesis.speak(speak);
      }

      if (intent === "navigate" && target) {
        navigate(target);
      }
    } catch (err) {
      console.error("Gemini AI error:", err);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    toast.success("Voice navigation started!")
    if (!SpeechRecognition) {
      alert("Voice recognition not supported.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = async (event) => {
        const transcript = event.results[event.resultIndex][0].transcript.trim();
        resetInactivityTimer();
        await handleVoiceCommand(transcript);
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
    setIsListening(true);
    resetInactivityTimer();
  };

  const stopListening = () => {
    toast.success("Voice navigation stopped!")
    if (recognitionRef.current) recognitionRef.current.stop();
    clearTimeout(inactivityTimerRef.current);
    setIsListening(false);
  };

  const handleVoiceToggle = () => {
    isListening ? stopListening() : startListening();
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("cartId");
    localStorage.removeItem("cartUserId");
    navigate("/login");
  };

  return (
    <div className="w-full">
      {/* Top Navbar */}
      <nav className="bg-[#0071dc] text-white px-4 py-3 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold">CustomerAI</h1>

        {/* Search */}
        <div className="flex items-center w-[35%] min-w-[250px]">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 rounded-l-md bg-white text-black outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-[#ffc220] text-black px-4 py-2 rounded-r-md font-semibold hover:bg-yellow-400 transition"
            onClick={triggerSearch}
          >
            Search
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <Link
            to={`/cart/${cartId}`}
            className="bg-white text-[#0071dc] px-3 py-2 rounded-md font-semibold hover:bg-gray-100 transition"
          >
            🛒 Cart
          </Link>
          

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="bg-white text-[#0071dc] px-3 py-2 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Hi, {user?.name || "Guest"} ⌄
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[#0071dc] hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Voice Nav */}
          <button
            onClick={handleVoiceToggle}
            className={`${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white px-3 py-2 rounded-md font-semibold transition`}
          >
            {isListening ? "Stop Voice Nav" : "Start Voice Nav"}
          </button>
        </div>
      </nav>

      {/* Bottom Navbar */}
      <div className="bg-[#f2f2f2] px-4 py-2 flex gap-6 justify-center text-[#0071dc] font-medium text-sm shadow-sm">
        <Link to="/home" className="hover:text-yellow-500 transition">All Products</Link>
        <Link to="/shoes" className="hover:text-yellow-500 transition">Shoes</Link>
        <Link to="/furniture" className="hover:text-yellow-500 transition">Furniture</Link>
        <Link to="/mobile" className="hover:text-yellow-500 transition">Mobile</Link>
        <Link to="/laptop" className="hover:text-yellow-500 transition">Laptop</Link>
        <Link to="/grocery" className="hover:text-yellow-500 transition">Grocery</Link>
      </div>
    </div>
  );
};

export default CustomerNavbar;
