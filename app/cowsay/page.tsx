import { GenericIOUISession } from "@/lib/components/views/genericIOUI";
import { say as cowsayCall } from "cowsay";
import { getServerSession } from "next-auth";

export default async function Page({ searchParams } : any ) {
  const session = await getServerSession();
  const cowsay = searchParams?.cowsay ? cowsayCall({ text: searchParams.cowsay, f:'r' }) : undefined;

  return (!session) ?  (
    <div className="text-center">You need to be logged in to use cowsay.</div>
  ) : (
    <main className="flex min-h-screen flex-col items-center">
      <GenericIOUISession session={session} inputs={[{
        id: 'cowsay',
        name: 'cowsay',
        prompt: 'What should the cow say?',
      }]} label={'Cowsay'} action={'/cowsay'} output={cowsay} />
    </main>
  );
};