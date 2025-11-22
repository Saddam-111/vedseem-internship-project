import React from "react";
import { Package, ShoppingCart, CheckCircle, DollarSign } from "lucide-react";

const StatsCard = () => {
  // ✅ Static card data
  const cards = [
    {
      title: "Total Items",
      value: 120,
      change: "+10 this month",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: 85,
      change: "+5 this week",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "Active Orders",
      value: 68,
      change: "Compared to last month",
      icon: CheckCircle,
      color: "bg-purple-500",
    },
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+15% growth",
      icon: DollarSign,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div
          key={index}
          className="rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{card.value}</p>
              <p className="text-sm mt-1 text-green-600">{card.change}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StatsCard;
