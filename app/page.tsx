import { SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <main className='flex h-screen items-center justify-center'>
      <div className='space-y-4 text-center p-4'>
        <h1 className='flex items-center justify-center text-5xl md:text-6xl font-semibold text-blue-950 drop-shadow-lg'>
          <Image
            src='/assets/icons/icon-144x144-removebg.png'
            alt='Life works Weirdly'
            width={100}
            height={100}
            priority={true}
          />
          <span className='ml-2'>Teams Work</span>
        </h1>
        <p className='pb-2 text-lg md:text-xl'>
          Unleash your inner unicorn! 🦄
        </p>

        <SignedOut>
          <div className='flex justify-center items-center'>
            <button className='flex items-center group px-4 py-2'>
              <SignInButton />
              <span className='transition-transform transform duration-300 ease-in-out group-hover:translate-x-2'>
                →
              </span>
            </button>
          </div>
        </SignedOut>
      </div>
    </main>
  );
}
