"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (<div className="grid min-h-[60vh] place-items-center p-8 text-center"><div><h1 className="text-3xl font-bold">Something went wrong</h1><p className="mt-2 text-slate-600">Please try again.</p><button onClick={reset} className="mt-4 rounded-full bg-black px-6 py-2 text-white">Try again</button></div></div>);
}
