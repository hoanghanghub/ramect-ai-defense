'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useRecordWebcam } from 'react-record-webcam';

export default function ScanPage() {
  const { t } = useLanguage();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [news, setNews] = useState('');
  const [reason, setReason] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // State cho webcam
  const [imageBase64, setImageBase64] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const { status, openCamera, closeCamera, captureScreenshot } = useRecordWebcam();

  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await fetch('/api/cases');
        const data = await res.json(); 
        if (!res.ok) {
          console.error('API Error Details:', res.status, data); 
          return;
        }
        if (data.success && data.cases && data.cases.length > 0) {
          setCases(data.cases);
          setSelectedCase(data.cases[0].case_id);
          setNews(data.cases[0].bait_context || data.cases[0].title || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }
    fetchCases();
  }, []);

  const handleSelectCase = (e) => {
    const cId = e.target.value;
    setSelectedCase(cId);
    const found = cases.find((c) => c.case_id === cId);
    if (found) {
      setNews(found.bait_context || found.title || '');
    }
  };

  const handleAuth = async (action) => {
    if (!studentId || !pin) {
      alert("Vui lòng nhập ID và PIN!");
      return;
    }
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, studentId, pin })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Server trả về không phải JSON:', text);
        alert("Lỗi: Không kết nối được tới API xác thực!");
        return;
      }
      if (!res.ok) {
        alert(data.error); 
        return;
      }
      alert(data.message);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Auth error:', error);
      alert("Lỗi kết nối máy chủ!");
    }
  };

  const handleCameraStart = async () => {
    setShowCamera(true);
    await openCamera();
  };

  const handleCameraStop = async () => {
    await closeCamera();
    setShowCamera(false);
  };

  const handleCapture = async () => {
    const blob = await captureScreenshot('image/jpeg');
    if (blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Bỏ phần "data:image/jpeg;base64," ở đầu
        const base64 = reader.result.split(',')[1];
        setImageBase64(base64);
        alert("Đã chụp ảnh thành công!");
      };
      reader.readAsDataURL(blob);
    }
  };

  const handleScan = async () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập trước khi phân tích!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId, 
          caseId: selectedCase,
          newsContext: news, 
          studentInput: reason,
          imageBase64: imageBase64 // Gửi kèm ảnh
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Server trả về không phải JSON. Nội dung:', text);
        throw new Error('Server bị lỗi nghiêm trọng');
      }

      if (!res.ok) {
        console.error('Analyze API Error Details:', res.status, data);
        alert(data.error || 'Đã xảy ra lỗi khi phân tích!');
        return;
      }

      if (data.success) {
        setResult(data.data);
      } else {
        console.error('Analyze returned error:', data);
      }
    } catch (err) {
      console.error('Analyze error:', err);
      alert("Có lỗi xảy ra khi gọi AI. Hãy kiểm tra lại Key Gemini!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto p-8 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-extrabold text-blue-700">{t.scan.title}</h1>
          <p className="text-gray-600">{t.scan.subtitle}</p>
        </div>

        {/* Form Đăng nhập / Đăng ký */}
        {!isLoggedIn && (
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-bold text-xl">Xác thực tài khoản</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">Student ID:</label>
                <input 
                  type="text" 
                  value={studentId} 
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-gray-50 font-bold"
                  placeholder="VD: SD01"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold mb-1">PIN:</label>
                <input 
                  type="password" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  placeholder="Nhập PIN"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAuth('login')}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng nhập
              </button>
              <button 
                onClick={() => handleAuth('register')}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
              >
                Đăng ký
              </button>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded-lg flex justify-between items-center">
            <span className="font-bold">Đã đăng nhập: {studentId}</span>
            <button onClick={() => setIsLoggedIn(false)} className="text-sm underline">Đăng xuất</button>
          </div>
        )}

        {/* Form Analyze chỉ hiện khi đã đăng nhập */}
        {isLoggedIn && (
          <>
            <div className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
              <div>
                <label className="block font-bold mb-1">{t.scan.selectCase}</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-gray-50 font-medium"
                  value={selectedCase}
                  onChange={handleSelectCase}
                >
                  {cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      [{c.case_id}] {c.title || c.bait_context?.substring(0, 50)}
                    </option>
                  ))}
                </select>
              </div>

              {/* PHẦN QUÉT ẢNH BẰNG CAMERA */}
              <div className="border-t pt-4 mt-4">
                <label className="block font-bold mb-2">Quét ảnh bằng Camera (tùy chọn):</label>
                {!showCamera ? (
                  <button 
                    onClick={handleCameraStart}
                    className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-900 transition"
                  >
                    Bật Camera lên
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border-2 border-gray-300">
                      <video className="w-full" autoPlay muted playsInline />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCapture}
                        className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                      >
                        Chụp ảnh
                      </button>
                      <button 
                        onClick={handleCameraStop}
                        className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
                      >
                        Tắt Camera
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hiển thị ảnh đã chụp */}
                {imageBase64 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-bold mb-2">Đã chụp ảnh thành công!</p>
                    <img 
                      src={`data:image/jpeg;base64,${imageBase64}`} 
                      alt="Ảnh đã chụp" 
                      className="w-full rounded-lg"
                    />
                    <button onClick={() => setImageBase64(null)} className="text-sm text-red-500 underline mt-2">Xóa ảnh</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">{t.scan.context}</label>
                <textarea 
                  className="w-full p-3 border rounded-lg bg-gray-50" 
                  rows="3" 
                  value={news}
                  onChange={(e) => setNews(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{t.scan.reasoning}</label>
                <textarea 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  rows="2" 
                  placeholder={t.scan.placeholder}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <button 
                onClick={handleScan} 
                disabled={loading || !news || !reason}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
              >
                {loading ? t.scan.analyzing : t.scan.analyze}
              </button>
            </div>

            {/* Phần hiển thị kết quả (giữ nguyên) */}
            {result && (
              <div className="bg-slate-50 border-2 border-blue-200 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-lg text-red-600">{t.scan.bias} {result.bias_detected}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">{t.scan.engine}</span>
                </div>
                <p className="text-gray-800"><strong>{t.scan.analysis}</strong> {result.analysis}</p>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                  <p className="text-yellow-900 font-bold">{t.scan.question}:</p>
                  <p className="text-yellow-800 italic mt-1">"{result.socratic_question}"</p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-2">
                  <div className="p-2 bg-white rounded border"><div className="text-xs text-gray-500">PAR</div><div className="font-bold text-blue-600">{result.scores.PAR}</div></div>
                  <div className="p-2 bg-white rounded border"><div className="text-xs text-gray-500">PER</div><div className="font-bold text-green-600">{result.scores.PER}</div></div>
                  <div className="p-2 bg-white rounded border"><div className="text-xs text-gray-500">TRR</div><div className="font-bold text-red-600">{result.scores.TRR}</div></div>
                  <div className="p-2 bg-white rounded border"><div className="text-xs text-gray-500">CAR</div><div className="font-bold text-purple-600">{result.scores.CAR}</div></div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}