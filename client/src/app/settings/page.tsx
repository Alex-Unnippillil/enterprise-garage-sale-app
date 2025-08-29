import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Settings</h1>
      <ul className="list-disc pl-4">
        <li>
          <Link href="/settings/trash" className="text-blue-600 underline">
            Trash
          </Link>
        </li>
      </ul>
    </div>
  );
}
