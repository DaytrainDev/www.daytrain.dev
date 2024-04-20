"use server";

import { BabylonJsSession } from "@/lib/components/babylonjs/babylonjs";

const Page = async ({ session }: any) => {

  return (
    <BabylonJsSession session={session} />
  );
}
export default Page;
