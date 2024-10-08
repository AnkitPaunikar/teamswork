import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image"; // Assuming you're using Next.js's Image component for the logo
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className='bg-white px-4 py-3 shadow-md'>
      <div className='container mx-auto flex items-center justify-between'>
        {/* Left: Logo */}
        <Link key='Home' href={`/dashboard`} passHref>
          <div className='flex items-center'>
            <Image
              src='/assets/icons/icon-144x144-removebg.png'
              alt='Logo'
              width={40}
              height={40}
              className='mr-2'
            />
            <span className='text-back text-xl font-bold'>Teams Work</span>
          </div>
        </Link>

        {/* Right: User Button */}
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
