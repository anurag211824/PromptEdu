"use client";
import { useUser } from "@clerk/nextjs";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState();
  const { user } = useUser();
  const CreateUser = async () => {
    const response = await fetch("api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user?.firstName,
        email: user?.primaryEmailAddress?.emailAddress,
      }),
    });

    const data = await response.json();

    if (data.success) {
        console.log(data.user.name);
        
      setUserDetails(data.user);
    }
  };
  useEffect(() => {
    user && CreateUser();
  }, [user]);
  return (
    <UserContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
