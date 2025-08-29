import Navbar from '@/components/navbar';
import Landing from './(nondashboard)/landing/page';
import DocPiP from '@/components/doc-pip';

export default function Home() {
  return (
    <div className="h-full w-full">
      <Navbar />
      <main className={`h-full flex w-full flex-col`}>
        <Landing />
        <DocPiP />
      </main>
    </div>
  );
}
