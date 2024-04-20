 import { GenericIOUISession } from "@/lib/components/genericIOUI";
import { say as cowsayCall } from "cowsay";

export default function Page({ session, searchParams } : any ) {
  const cowsay = searchParams?.cowsay ? cowsayCall({ text: searchParams.cowsay, f:'r' }) : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center">
      <GenericIOUISession session={session} inputs={[{
        id: 'cowsay',
        name: 'cowsay',
        prompt: 'What should the cow say?',
      }]} label={'Cowsay'} action={'/cowsay'} output={cowsay} />
    </main>
  );
};