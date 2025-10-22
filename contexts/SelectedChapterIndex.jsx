'use client'
import { createContext, useEffect, useState } from "react";
export const SelectedChapterIndex = createContext();

const SelectedChapterIndexProvider = ({ children }) => {
  const [selectedChapterIndex,setSelectedChapterIndex] = useState(0)
  return (
    <SelectedChapterIndex.Provider value={{selectedChapterIndex,setSelectedChapterIndex}}>
      {children}
    </SelectedChapterIndex.Provider>
  );
};

export default SelectedChapterIndexProvider;
