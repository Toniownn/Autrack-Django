import ctuBuilding from "@/assets/ctuBuilding.jpg";

const Banner = () => {
  return (
    <section className="relative rounded-2xl shadow-lg p-8 md:p-12 mt-8 flex flex-col md:flex-row items-center justify-between overflow-hidden">
      {/* Background image with directional fade to the right */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${ctuBuilding})`,
          maskImage: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))",
        }}
      />

      {/* Gradient overlay with blend mode to show image */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 mix-blend-overlay" />

      {/* Content */}
      <div className="relative text-center md:text-left max-w-xl z-10 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Classroom Reservation System
        </h1>
        <p className="text-lg text-orange-100 mb-6">
          Easily reserve classrooms for lectures, meetings, or special events.
          Manage schedules and avoid conflicts — all in one place.
        </p>
        <button className="bg-white text-orange-700 font-semibold px-6 py-3 rounded-full shadow hover:bg-orange-100 transition duration-200">
          Reserve Now
        </button>
      </div>

      {/* SVG illustration */}
      <div className="relative mt-8 md:mt-0 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-48 h-48 text-white/90"
          fill="none"
          viewBox="0 0 64 64"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* Blackboard */}
          <rect
            x="8"
            y="12"
            width="48"
            height="28"
            rx="2"
            ry="2"
            fill="none"
            stroke="currentColor"
          />
          <line
            x1="8"
            y1="40"
            x2="56"
            y2="40"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Table */}
          <rect x="14" y="44" width="36" height="4" fill="currentColor" />
          <line
            x1="18"
            y1="48"
            x2="18"
            y2="54"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="46"
            y1="48"
            x2="46"
            y2="54"
            stroke="currentColor"
            strokeWidth="2"
          />

          {/* Clock */}
          <circle
            cx="52"
            cy="10"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="52"
            y1="10"
            x2="52"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="52"
            y1="10"
            x2="54"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </section>
  );
};

export default Banner;
