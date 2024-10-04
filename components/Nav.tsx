import { SignedIn, UserButton } from "@clerk/nextjs";

export default function NavBar() {
  return (
    <>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </>
  );
}
