"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "@/lib/opfs-tasks";

export default function ShareTargetPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleShare() {
      if ("launchQueue" in window) {
        (window as any).launchQueue.setConsumer(async (launchParams: any) => {
          if (launchParams.files?.length) {
            for (const file of launchParams.files) {
              await addTask({ text: file.name, file });
            }
          }
          const text = launchParams?.text || "";
          if (text) {
            await addTask({ text });
          }
          router.replace("/tasks");
        });
      } else {
        const params = new URLSearchParams(window.location.search);
        const text = params.get("text") || params.get("title");
        if (text) {
          await addTask({ text });
        }
        router.replace("/tasks");
      }
    }
    handleShare();
  }, [router]);

  return <p>Processing shared content...</p>;
}
