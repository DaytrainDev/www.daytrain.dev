"use client";
import React from "react";
import {
  ArcRotateCamera,
  Color3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { BabylonScene } from "@/lib/components/babylonScene";
import { SessionProvider, useSession } from "next-auth/react";

const onSceneReady = (scene: any, canvas: any) => {
  // scene.createDefaultCamera(true);
  var camera = new ArcRotateCamera(
    "Camera",
    (3 * Math.PI) / 2,
    Math.PI / 8,
    20,
    Vector3.Zero(),
    scene
  );
  // camera.attachControl(canvas, true);

  var light = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  light.intensity = 1;

  const sphere = MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 1, segments: 32 },
    scene
  );
  sphere.scaling = new Vector3(1, 1, 1);

  scene.onKeyboardObservable.add((kbInfo: any) => {
    if (kbInfo.type === 1 && kbInfo.event.key === "w") {
      sphere.position.z += 0.1;
      console.log("FORWARD");
    } else if (kbInfo.type === 1 && kbInfo.event.key === "s") {
      sphere.position.z -= 0.1;
      console.log("BACKWARD");
    }

    if (kbInfo.type === 1 && kbInfo.event.key === "a") {
      sphere.position.x -= 0.1;
      console.log("LEFT");
    } else if (kbInfo.type === 1 && kbInfo.event.key === "d") {
      sphere.position.x += 0.1;
      console.log("RIGHT");
    }

    // // TODO: jumping
    // if (kbInfo.type === 1 && kbInfo.event.key === " ") {
    //   sphere.position.y += 0.1;
    //   console.log("UP");
    // }
    // if (kbInfo.type === 1 && kbInfo.event.key === "c") {
    //   sphere.position.y -= 0.1;
    //   console.log("DOWN");
    // }

    // console.log(kbInfo.event.key);
    // TODO: actions
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
    <div className="link-back">
      <a href="/" rel="noreferrer">...back to home</a>
    </div>
  </>
) : (
    <>
      <BabylonScene
        antialias
        onSceneReady={onSceneReady}
        onRender={onRender}
        id="babylonjs-canvas"
      />
    </>
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
