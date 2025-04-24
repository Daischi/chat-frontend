import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600">Chat Virtual</h1>
          <p className="mt-2 text-gray-600">
            Conecte-se com amigos e participe do grupo global
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Entrar
            </Button>
          </Link>

          <Link href="/register" className="w-full">
            <Button
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-50"
            >
              Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
