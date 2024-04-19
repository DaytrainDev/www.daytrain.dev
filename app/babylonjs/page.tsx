"use server";

import { BabylonJsSession } from "@/lib/components/babylonjs/babylonjs";

const Page = ({ session }: any) => {
  "use server";

  return (
    <BabylonJsSession session={session} />
  );
}
export default Page;
