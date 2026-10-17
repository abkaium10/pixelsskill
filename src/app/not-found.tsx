import Link from "next/link";
export default function NotFound() { return (<div className="grid min-h-[60vh] place-items-center p-8 text-center"><div><h1 className="text-4xl font-bold">Page not found</h1><Link href="/services" className="mt-4 inline-block text-teal underline">Browse services</Link></div></div>); }
