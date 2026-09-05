'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function SubmitCasePage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ 
    title: '', 
    bait_context: '', 
    content_type: 'News', 
    topic_group: 'News', 
    student_id: 'SD01' 
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setMsg(data.error || 'Có lỗi xảy ra!');
      } else {
        setMsg(data.message);
        // Reset form sau khi gửi thành công
        setForm({ title: '', bait_context: '', content_type: 'News', topic_group: 'News', student_id: form.student_id });
      }
    } catch (err) {
      setMsg("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto p-8">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700">Đóng góp Case cộng đồng</h1>
          <p className="text-gray-600">Gửi những bài viết, ảnh bạn thấy trên mạng xã hội để hệ thống phân tích và phục vụ trò chơi.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block font-bold mb-1">Tiêu đề bài viết / Case:</label>
            <input 
              className="w-full border p-3 rounded-lg bg-gray-50" 
              placeholder="VD: Bài viết lan truyền về..."
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Nội dung bài viết / Ảnh:</label>
            <textarea 
              className="w-full border p-3 rounded-lg bg-gray-50" 
              rows={5} 
              placeholder="Dán nội dung văn bản hoặc mô tả ảnh bạn thấy..."
              value={form.bait_context} 
              onChange={e => setForm({...form, bait_context: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Loại nội dung:</label>
              <select 
                className="w-full border p-3 rounded-lg bg-gray-50" 
                value={form.content_type} 
                onChange={e => setForm({...form, content_type: e.target.value})}
              >
                <option value="News">News</option>
                <option value="Social Media">Social Media</option>
                <option value="Image Trap">Image Trap</option>
                <option value="Deepfake">Deepfake</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Mã sinh viên của bạn:</label>
              <input 
                className="w-full border p-3 rounded-lg bg-gray-50" 
                placeholder="VD: SD01"
                value={form.student_id} 
                onChange={e => setForm({...form, student_id: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition"
          >
            {loading ? 'Đang gửi...' : 'Gửi lên hệ thống'}
          </button>

          {msg && (
            <div className={`p-3 rounded-lg text-center font-bold ${msg.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}