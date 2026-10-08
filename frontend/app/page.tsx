"use client";

import { useState } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle, Activity, ChevronRight, RefreshCw, ShieldAlert, Printer, Smartphone } from "lucide-react";

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/analyze-report", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Universal Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white pt-10 pb-10 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-1 backdrop-blur-md shadow-inner">
            <Activity className="w-8 h-8 text-blue-300 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Report, Decoded</h1>
          <p className="text-blue-100 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed">
            Instant plain-language explanations for complex lab tests. Built for families and district healthcare workers.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Upload State */}
        {!reportData && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed border-blue-300 rounded-3xl bg-white hover:bg-blue-50/50 cursor-pointer transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                {isUploading ? (
                  <div className="animate-pulse flex flex-col items-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-base text-blue-900 font-bold">Reading document & applying clinical rules...</p>
                    <p className="text-xs text-gray-400">Processing tables securely</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="mb-1 text-base text-gray-800 font-bold">Tap to upload or snap a photo</p>
                    <p className="text-xs text-gray-400">Optimized for mobile cameras, PDFs, and lab printouts</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={isUploading} />
            </label>

            {/* Cross-Platform Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span>Fully responsive for iOS, Android, Windows, and Linux browsers</span>
            </div>
          </div>
        )}

        {/* Results State */}
        {reportData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-center p-2.5 rounded-xl bg-gray-50/80 border border-gray-100">
                <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-xl md:text-2xl font-black text-gray-800">{reportData.summary.total}</p>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-green-50/80 border border-green-100">
                <p className="text-[10px] md:text-xs text-green-600 font-bold uppercase tracking-wider mb-0.5">Normal</p>
                <p className="text-xl md:text-2xl font-black text-green-700">{reportData.summary.normal}</p>
              </div>
              <div className="text-center p-2.5 rounded-xl bg-red-50/80 border border-red-100">
                <p className="text-[10px] md:text-xs text-red-600 font-bold uppercase tracking-wider mb-0.5">Attention</p>
                <p className="text-xl md:text-2xl font-black text-red-700">{reportData.summary.alert}</p>
              </div>
            </div>

            {/* Parameter Cards Stack (Responsive single/double column) */}
            <div className="space-y-3">
              {reportData.parameters.map((param: any, idx: number) => {
                const isAlert = param.status === 'HIGH' || param.status === 'LOW';
                return (
                  <div key={idx} className={`bg-white p-4 md:p-5 rounded-2xl shadow-sm border-l-4 transition-all ${
                    isAlert ? 'border-l-red-500 border border-gray-100' : 'border-l-green-500 border border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-extrabold text-gray-900 text-base md:text-lg">{param.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-black tracking-wide flex items-center gap-1 ${
                        isAlert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isAlert ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {param.status}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3 bg-gray-50/70 py-1.5 px-3 rounded-lg">
                      <span className="text-2xl md:text-3xl font-black text-gray-900">{param.value}</span>
                      <span className="text-xs md:text-sm font-semibold text-gray-500">{param.unit}</span>
                      <span className="text-[10px] md:text-xs text-gray-400 ml-auto bg-white px-2 py-0.5 rounded shadow-xs border border-gray-100">Ref: {param.reference_range}</span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                      {param.explanation}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Doctor Pre-Consultation Summary Card */}
            <div className="bg-blue-900 rounded-2xl p-5 md:p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-300" />
                  Questions for your doctor tomorrow:
                </h3>
                <button 
                  onClick={handlePrint}
                  className="hidden md:flex items-center gap-1.5 text-xs bg-blue-800 hover:bg-blue-700 text-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-700"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Card
                </button>
              </div>
              
              <ul className="space-y-2.5">
                {reportData.questions_for_doctor.map((q: string, idx: number) => (
                  <li key={idx} className="text-blue-50 text-xs md:text-sm flex items-start gap-2.5 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-300" />
                    <span className="font-medium leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-blue-800/60 pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <p className="text-[10px] text-blue-300/70 font-medium leading-normal">
                  *Rules determine clinical status. AI translates terminology. Always confirm with a physician.
                </p>
                <button 
                  onClick={handlePrint}
                  className="md:hidden w-full flex items-center justify-center gap-2 text-xs bg-blue-800 text-blue-100 py-2 rounded-xl font-bold"
                >
                  <Printer className="w-4 h-4" /> Print / Save Doctor Summary
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setReportData(null)}
              className="w-full py-3.5 text-xs md:text-sm font-bold text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-xl hover:bg-blue-50/50 transition-all shadow-xs"
            >
              Scan another report
            </button>
          </div>
        )}
      </div>
    </main>
  );
}