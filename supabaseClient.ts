
import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
// 尝试读取钥匙，如果读不到就给个空字符串，而不是直接报错（Throw Error）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// 【关键修改】：把原来的 throw new Error 注释掉，或者改成 console.warn
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase keys missing. Database features might not work, but Link is starting...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
=======
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
>>>>>>> 3e4b0844055cf85b6030b1319d90e1196695fd23
