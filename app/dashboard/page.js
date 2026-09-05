'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState('SD01');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      if (!res.ok) {
        setError(data.error || 'Không thể lấy dữ liệu');
        setProfile(null);
        return;
      }

      setProfile(data.data);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Tính điểm trung bình cho biểu đồ
  const getAverageScores = () => {
    if (!profile || !profile.history_scores || profile.history_scores.length === 0) {
      return [];
    }
    
    const totalScores = profile.history_scores.reduce((acc, curr) => {
      acc.PAR += curr.scores.PAR;
      acc.PER += curr.scores.PER;
      acc.TRR += curr.scores.TRR;
      acc.CAR += curr.scores.CAR;
      return acc;
    }, { PAR: 0, PER: 0, TRR: 0, CAR: 0 });

    const count = profile.history_scores.length;
    
    return [
      { subject: 'PAR', fullName: 'Perception Accuracy', value: Math.round(totalScores.PAR / count) },
      { subject: 'PER', fullName: 'Pattern Exploitation Resistance', value: Math.round(totalScores.PER / count) },
      { subject: 'TRR', fullName: 'Trapped Risk Rate', value: Math.round(totalScores.TRR / count) },
      { subject: 'CAR', fullName: 'Critical Analysis Rate', value: Math.round(totalScores.CAR / count) },
    ];
  };

  const chartData = getAverageScores();

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-extrabold text-blue-700">{t.dashboard.title}</h1>
          <p className="text-gray-600">{t.dashboard.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Nhập Student ID (VD: SD01)"
            className="flex-1 p-3 border rounded-lg bg-gray-50 font-bold"
          />
          <button 
            onClick={fetchProfile}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Xem Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
            {error} - <Link href="/scan" className="underline">Go to Scan</Link>
          </div>
        )}

        {loading && <div className="text-center py-10">Đang tải dữ liệu...</div>}

        {!loading && profile && (
          <>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="font-bold text-xl mb-4">{t.dashboard.overview}</h2>
              
              {chartData.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {t.dashboard.noData} 
                  <div className="mt-4">
                    <Link href="/scan" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                      {t.dashboard.backToScan}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Điểm TB" dataKey="value" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-bold text-xl mb-4">{t.dashboard.history}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3">Case ID</th>
                        <th className="p-3">PAR</th>
                        <th className="p-3">PER</th>
                        <th className="p-3">TRR</th>
                        <th className="p-3">CAR</th>
                        <th className="p-3">Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.history_scores.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-3">{item.case_id}</td>
                          <td className="p-3 text-blue-600 font-bold">{item.scores.PAR}</td>
                          <td className="p-3 text-green-600 font-bold">{item.scores.PER}</td>
                          <td className="p-3 text-red-600 font-bold">{item.scores.TRR}</td>
                          <td className="p-3 text-purple-600 font-bold">{item.scores.CAR}</td>
                          <td className="p-3 text-gray-500">{new Date(item.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}