import { createContext, useContext, useState } from "react";

const RecentlyViewedContext = createContext();

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const addRecentlyViewed = (product) => {
    setRecentlyViewed((prev) => {
      // remove duplicates
      const filtered = prev.filter((p) => p._id !== product._id);

      // add to top & limit to 6
      return [product, ...filtered].slice(0, 6);
    });
  };

  return (
    <RecentlyViewedContext.Provider
      value={{ recentlyViewed, addRecentlyViewed }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () =>
  useContext(RecentlyViewedContext);
