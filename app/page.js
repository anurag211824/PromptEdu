
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <>
      <h1>Hello world</h1>
      <Button>Hello</Button>
      <UserButton/>
    </>
  );
}
