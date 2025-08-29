import MoodManager from "@/components/mood-manager";

export default function MoodPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Moods</h1>
      <MoodManager />
    </main>
  );
}
