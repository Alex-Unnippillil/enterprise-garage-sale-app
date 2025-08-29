"use client";

import React, { useRef } from "react";

interface Slide {
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    title: "Welcome",
    body: "Discover bargains and sell unused items.",
  },
  {
    title: "Search",
    body: "Filter listings by category, location and price.",
  },
  {
    title: "List",
    body: "Quickly post items with photos and descriptions.",
  },
];

const SlideViewer = () => {
  const indexRef = useRef(0);
  const pipRef = useRef<Window | null>(null);

  const renderSlide = () => {
    const pip = pipRef.current;
    if (!pip) return;
    const { title, body } = slides[indexRef.current];
    const doc = pip.document;
    doc.body.innerHTML = "";
    const h1 = doc.createElement("h1");
    h1.textContent = title;
    const p = doc.createElement("p");
    p.textContent = body;
    doc.body.appendChild(h1);
    doc.body.appendChild(p);
  };

  const next = () => {
    indexRef.current = (indexRef.current + 1) % slides.length;
    renderSlide();
  };

  const prev = () => {
    indexRef.current = (indexRef.current - 1 + slides.length) % slides.length;
    renderSlide();
  };

  const open = async () => {
    const anyWindow = window as any;
    if (!anyWindow.documentPictureInPicture) return;
    const pip: Window = await anyWindow.documentPictureInPicture.requestWindow({
      width: 400,
      height: 300,
    });
    pipRef.current = pip;

    const style = pip.document.createElement("style");
    style.textContent = `body{font-family:sans-serif;margin:0;padding:1rem;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:white;}h1{font-size:1.25rem;margin-bottom:.5rem;}`;
    pip.document.head.appendChild(style);

    renderSlide();

    pip.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    window.addEventListener("focus", () => pip.focus());
  };

  return (
    <button
      onClick={open}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Open Slides
    </button>
  );
};

export default SlideViewer;

