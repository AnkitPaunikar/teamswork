"use client";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen w-full flex items-center justify-center text-3xl font-semibold text-blue-950 drop-shadow-lg'>
      {children}
    </div>
  );
}
