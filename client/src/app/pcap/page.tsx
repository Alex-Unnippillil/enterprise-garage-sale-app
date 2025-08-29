import PcapAnalyzer from "@/components/pcap-analyzer";

export default function PcapPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">PCAP Analyzer</h1>
      <PcapAnalyzer />
    </div>
  );
}
