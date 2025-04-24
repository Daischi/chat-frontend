import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-green-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          Página não encontrada
        </h2>
        <p className="text-gray-600">
          A página que você está procurando não existe ou foi movida.
        </p>

        <Link href="/">
          <Button className="mt-4 bg-green-600 hover:bg-green-700">
            Voltar para a página inicial
          </Button>
        </Link>
      </div>
    </div>
  );
}
