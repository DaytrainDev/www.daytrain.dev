"use client";
import { Engine, Scene } from "@babylonjs/core";
import React, { useEffect, useRef, useState } from "react";

// https://forum.babylonjs.com/t/how-to-use-babylon-with-next-js/26665/3
export const BabylonScene = (props : any) => {
  const reactCanvas = useRef(null);
  const {
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    ...rest
  } = props;

  const [loaded, setLoaded] = useState(false);
  const [scene, setScene] = useState(null as any);

  useEffect(() => {
    if (window) {
      const resize = () => {
        if (scene) {
          scene.getEngine().resize();
        }
      };
      window.addEventListener("resize", resize);

      return () => {
        window.removeEventListener("resize", resize);
      };
    }
  }, [scene]);

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      const engine = new Engine(
        reactCanvas.current,
        antialias,
        engineOptions,
        adaptToDeviceRatio
      );
      const scene = new Scene(engine, sceneOptions);
      setScene(scene);
      if (scene.isReady()) {
        props.onSceneReady(scene, reactCanvas.current);
      } else {
        scene.onReadyObservable.addOnce((scene) => props.onSceneReady(scene, reactCanvas.current));
      }

      engine.runRenderLoop(() => {
        if (typeof onRender === "function") {
          onRender(scene);
        }
        scene.render();
      });
    }

    return () => {
      if (scene !== null) {
        scene.dispose();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactCanvas, scene]);

  return (
    <canvas
      style={{ width: "100%", height: "100%" }}
      ref={reactCanvas}
      {...rest}
    />
  );
};
