"use client";
import React from "react";
import { MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";
import { BabylonScene } from "@/lib/components/babylonScene";

const onSceneReady = (scene: any) => {
  scene.createDefaultCamera(true);

  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
  sphere.scaling = new Vector3(0.05, 0.05, 0.05);

  scene.onKeyboardObservable.add((kbInfo: any) => {
    if (kbInfo.type === 1 && kbInfo.event.key === "w") {
      sphere.position.z += 0.01;
      console.log("FORWARD", kbInfo);
    } else if (kbInfo.type === 1 && kbInfo.event.key === "s") {
      sphere.position.z -= 0.01;
      console.log("BACKWARD", kbInfo);
    }
    
    if (kbInfo.type === 1 && kbInfo.event.key === "a") {
      sphere.position.x -= 0.01;
      console.log("LEFT", kbInfo);
    } else if (kbInfo.type === 1 && kbInfo.event.key === "d") {
      sphere.position.x += 0.01;
      console.log("RIGHT", kbInfo);
    }

    // TODO: jumping

    // TODO: actions

  });

  return scene;
};

const onRender = (scene: any) => {};

const Page = () => {


  return <BabylonScene
    antialias
    onSceneReady={onSceneReady}
    onRender={onRender}
    id="babylonjs-canvas"
  />;
}

export default Page;