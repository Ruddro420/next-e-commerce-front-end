import { Birdhouse, Check, LaptopMinimal, MonitorCog } from "lucide-react";

export const topCategories = [
  { label: "হোম", active: true },
  { label: "ইলেকট্রনিক্স ও গ্যাজেট" },
  { label: "গাড়ি ও লেদার" },
  { label: "কাঁচাল ও ফল" },
  { label: "মিষ্টি ও স্ন্যাক্স" },
  { label: "হস্তশিল্প" },
  { label: "গৃহসজ্জা" },
  { label: "ঈদ কালেকশন", pill: true },
];

export const featuredCategories = [
  { name: "Starlink", icon: "🛰️" },
  { name: "Water Heater Geyser", icon: "♨️" },
  { name: "Drone", icon: "🚁" },
  { name: "Gimbal", icon: "🎥" },
  { name: "Table PC", icon: "🖥️" },
  { name: "TV", icon: "📺" },
  { name: "Mobile Phone", icon: "📱" },
  { name: "Mobile Accessories", icon: "🔌" },
  { name: "Portable SSD", icon: "💾" },
  { name: "WiFi Camera", icon: "📷" },
  { name: "Trimmer", icon: "✂️" },
  { name: "Smart Watch", icon: "⌚" },
  { name: "Action Camera", icon: "🎬" },
  { name: "Earbuds", icon: "🎧" },
  { name: "Bluetooth Speakers", icon: "🔊" },
  { name: "Gaming Console", icon: "🎮" },
];

export const quickFeatures = [
  { title: "Laptop Finder", sub: "Find Your Laptop Easily", icon: <LaptopMinimal /> },
  { title: "Raise a Complain", sub: "Share your experience", icon: <Check /> },
  { title: "Home Service", sub: "Get expert help.", icon: <Birdhouse />},
  { title: "Servicing Center", sub: "Repair Your Device", icon: <MonitorCog />},
];

export const freshDrops = [
  { name: "Anua Peach Niacin Spread Cleansing Foam 150ml", size: "150ml", price: "৳1,499", color: "bg-red-500" },
  { name: "Medicube Kojic Acid Turmeric Toning Cleanser 120g", size: "120g", price: "৳1,699", color: "bg-yellow-200" },
  { name: "PURITO SEOUL Wonder Releaf Centella Cream Unscented 50ml", size: "50ml", price: "৳1,699", color: "bg-emerald-200" },
  { name: "Celimax The Real Noni Energy Ampoule 10ml", size: "10ml", price: "৳400", color: "bg-lime-200" },
];
