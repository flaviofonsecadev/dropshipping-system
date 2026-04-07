import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
        Sistema Dropshipping
      </h1>
      <div className="flex gap-4">
        <Link href="/supplier">
          <Button size="lg">Portal do Fornecedor</Button>
        </Link>
        <Link href="/reseller">
          <Button variant="outline" size="lg">Portal do Revendedor</Button>
        </Link>
      </div>
    </main>
  );
}
