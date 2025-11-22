import React from "react";

const Stats = () => {
  return (
    <div className="w-full bg-yellow-50 px-4 py-10">
      
      {/* Heading (Horizontal on mobile, Vertical on desktop) */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        
        <h1
          className="
            text-4xl sm:text-5xl md:text-7xl font-bold text-yellow-300
            text-center
            md:-rotate-90 md:writing-mode-vertical-rl 
          "
        >
          Stats
        </h1>

        {/* Stats container */}
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            gap-8 
            w-full
          "
        >
          {/* Stat 1 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-400">
              500+
            </h1>
            <p className="text-gray-500">
              Gifts are customized
            </p>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-400">
              6
              <span className="align-top text-sm sm:text-base md:text-lg">
                thousand
              </span>
              +
            </h1>
            <p className="text-gray-500">
              Gift boxes delivered across the city
            </p>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-400">
              1000+
            </h1>
            <p className="text-gray-500">
              Happy customers
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
