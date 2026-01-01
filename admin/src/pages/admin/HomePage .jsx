import React from "react";
import { useNavigate } from "react-router-dom"; 
// (whatever components you already use)

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      

      {/* Add this button anywhere you want */}
      <div className="flex justify-center mt-8 mb-10">
        <button
          onClick={() => navigate("/admin")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition font-semibold"
        >
          Go to Admin Panel
        </button>
      </div>

      {/* other sections... */}
    </div>
  );
};

export default Home;
