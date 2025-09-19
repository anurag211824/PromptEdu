import React from "react";

function WelcomeBanner() {
  return (
    <div
      className="p-5 rounded-xl shadow-md 
    bg-gradient-to-r from-blue-500 to-indigo-500 
    dark:from-gray-800 dark:to-gray-900 
    text-white dark:text-gray-100 bg-black"
    >
      <h1 className="font-bold text-2xl mb-2">Welcome to PromptEdu</h1>
      <p className="text-lg">
        Learn, Create and Explore Your favourite courses
      </p>
    </div>
  );
}

export default WelcomeBanner;
