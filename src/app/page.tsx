import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
        Sistema Dropshipping
      </h1>
      <div className="flex gap-4">
        <Button size="lg" asChild>
          <Link href="/supplier">Portal Supplier</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/reseller">Portal Reseller</Link>
        </Button>
      </div>
    </main>
  );
}
