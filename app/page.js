"use client";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/contexts/UserContext";

import { UserButton } from "@clerk/nextjs";
import { useContext } from "react";


export default function Home() {
  const {userDetails} = useContext(UserContext)
  console.log(userDetails);
  
  return (
    <>
      <h1>Hello world</h1>
      <Button>Hello</Button>
      <UserButton/>
      {userDetails && userDetails.email}
    
    </>
  );
}
