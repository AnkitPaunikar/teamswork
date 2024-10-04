import { Button } from "@/components/ui/button";
import { SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <main className='flex h-full items-center justify-center'>
      <div className='space-y-2 text-center'>
        <h1 className='flex items-center justify-center text-6xl font-semibold text-blue-950 drop-shadow-lg'>
          <Image
            src='/assets/icons/icon-144x144-removebg.png'
            alt='Life works Weirdly'
            width={100}
            height={100}
            priority={true}
          />
          Teams Work
        </h1>
        <p className='pb-2'>Unleash your inner unicorn! 🦄</p>
        <SignedOut>
          <Button variant='default'>
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </main>
  );
}
