"use client";
import React from "react";
import {
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { BabylonScene } from "@/lib/components/babylonScene";
import { SessionProvider, useSession } from "next-auth/react";

const TIME_SCALE = 6;
let player = {
  status: {
    hp: 10,
    mp: 5,
  },
  stats: {
    speed: 30,
  },
  token: undefined as any,
} as any;

const onSceneReady = (scene: any, canvas: any) => {
  const engine = scene.getEngine();
  new ArcRotateCamera(
    "Camera",
    (3 * Math.PI) / 2,
    Math.PI / 8,
    25,
    Vector3.Zero(),
    scene
  );

  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 1;

  player.token = MeshBuilder.CreateCapsule(
    "player",
    { radius: 0.5, height: 2 },
    scene
  );
  player.token.scaling = new Vector3(1, 1, 1);

  scene.onKeyboardObservable.add((kbInfo: any) => {
    const distance = player.stats.speed / ( TIME_SCALE * engine.getDeltaTime() );
    let direction = Vector3.Zero();
    if (kbInfo.type === 1 && kbInfo.event.key === "w") {
      direction = Vector3.Forward();
    } else if (kbInfo.type === 1 && kbInfo.event.key === "s") {
      direction = Vector3.Backward();
    }

    if (kbInfo.type === 1 && kbInfo.event.key === "a") {
      direction = Vector3.Left();
    } else if (kbInfo.type === 1 && kbInfo.event.key === "d") {
      direction = Vector3.Right();
    }

    if (direction) {
      console.log("move", direction, distance);
      player.token.translate(direction, distance);
    }
  });

  return scene;
};

const onRender = (scene: any) => {
  if (scene) {
    // console.log(scene);
  }
};

const Scene = () => {
  const session = useSession();

  return session.status === "loading" ? (
    <div>Loading...</div>
  ) : !(session.status === "authenticated") ?  (<>
    <div>You need to be logged in to babylon.</div>
  </>
) : (
    <div className="flex flex-col items-center">
      <div className="flex flex-row items-center">
        <h1 className="border-slate-100 border-2 border-dashed p-2">3D Demo</h1>
        <p className="p-2">WASD to move.</p>
      </div>
      <BabylonScene
        antialias
        onSceneReady={onSceneReady}
        onRender={onRender}
        id="babylonjs-canvas"
      />
    </div>
  );
};

const Page = ({ session }: any) => {
  return (
    <SessionProvider session={session}>
      <Scene />
    </SessionProvider>
  );
};

export default Page;
