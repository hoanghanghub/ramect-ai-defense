import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kiểm tra trước khi khởi tạo để tránh crash
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Lỗi cấu hình: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local");
}

// Dùng giá trị mặc định tạm thời để tránh lỗi crash hoàn toàn (nếu thiếu env)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);