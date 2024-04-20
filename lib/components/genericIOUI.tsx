"use client";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

function GenericIOUI({ inputs, label, action, output }: any) {
  const session = useSession();

  return (
    <div>
      <form className="flex flex-col items-center p-2" action={action} method="GET">
        {inputs.map((input: any, idx: number) => (<>
          <label htmlFor={input?.id ?? `field_${idx}`} className="text-lg font-bold mb-2">{input.prompt}</label>
          <input type="text" id={input?.id ?? `field_${idx}`} name={input.name} className="border border-gray-300 rounded-md p-2 bg-transparent" />
        </>))}
        
        <button type="submit" className="bg-transparent p-3">{label}</button>
      </form>
      {output && <pre className={'border-solid border-2 p-2 min-w-80'}>{output}</pre>}
    </div>
  );
}
interface GenericIOUISessionProps { 
  session: Session; 
  inputs: [{
    id?: string;
    name: string;
    prompt: string;
  }]; 
  label: string;
  action: string;
  output?: string;
}

export function GenericIOUISession({ session, inputs, label, action, output } : GenericIOUISessionProps ) {

  return (
      <SessionProvider session={session}>
        <GenericIOUI inputs={inputs} label={label} output={output} action={action}/>
      </SessionProvider>
  );
};