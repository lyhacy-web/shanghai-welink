
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { AppLanguage } from '../types';

interface LoginViewProps {
  lang: AppLanguage;
}

const LoginView: React.FC<LoginViewProps> = ({ lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const avatars = [
    { name: 'Tower', icon: '🗼' },
    { name: 'Dumpling', icon: '🥟' },
    { name: 'Plane Tree', icon: '🌳' },
    { name: 'Clock Tower', icon: '🕰️' },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }
        if (!selectedAvatar) {
          throw new Error("Please pick your Shanghai Identity");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              avatar_url: selectedAvatar,
            },
          },
        });
        if (error) throw error;
        alert('Registration successful! Please check your email for verification.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const t: Record<AppLanguage, any> = {
    EN: { login: 'Sign In', register: 'Sign Up', email: 'Email', password: 'Password', confirm: 'Confirm Password', submit: 'Continue', switchLogin: 'Already have an account? Sign In', switchRegister: "Don't have an account? Sign Up", pickIdentity: "Pick your Shanghai Identity" },
    CN: { login: '登录', register: '注册', email: '邮箱', password: '密码', confirm: '确认密码', submit: '继续', switchLogin: '已有账号？登录', switchRegister: '没有账号？注册', pickIdentity: "选择你的上海名片" },
    JP: { login: 'ログイン', register: '登録', email: 'メール', password: 'パスワード', confirm: 'パスワード確認', submit: '続ける', switchLogin: 'アカウントをお持ちですか？ログイン', switchRegister: 'アカウントをお持ちでないですか？登録', pickIdentity: "上海のアイデンティティを選択" },
    KR: { login: '로그인', register: '회원가입', email: '이메일', password: '비밀번호', confirm: '비밀번호 확인', submit: '계속하기', switchLogin: '계정이 있으신가요? 로그인', switchRegister: '계정이 없으신가요? 회원가입', pickIdentity: "상하이 아이덴티티 선택" },
    FR: { login: 'Connexion', register: 'Inscription', email: 'Email', password: 'Mot de passe', confirm: 'Confirmer le mot de passe', submit: 'Continuer', switchLogin: 'Déjà un compte ? Connexion', switchRegister: "Pas de compte ? Inscription", pickIdentity: "Choisissez votre identité de Shanghai" },
    ES: { login: 'Iniciar sesión', register: 'Registrarse', email: 'Correo', password: 'Contraseña', confirm: 'Confirmar contraseña', submit: 'Continuar', switchLogin: '¿Ya tienes cuenta? Iniciar sesión', switchRegister: "¿No tienes cuenta? Registrarse", pickIdentity: "Elige tu identidad de Shanghai" },
    DE: { login: 'Anmelden', register: 'Registrieren', email: 'E-Mail', password: 'Passwort', confirm: 'Passwort bestätigen', submit: 'Weiter', switchLogin: 'Bereits ein Konto? Anmelden', switchRegister: "Kein Konto? Registrieren", pickIdentity: "Wähle deine Shanghai-Identität" },
    IT: { login: 'Accedi', register: 'Registrati', email: 'Email', password: 'Password', confirm: 'Conferma password', submit: 'Continua', switchLogin: 'Hai già un account? Accedi', switchRegister: "Non hai un account? Registrati", pickIdentity: "Scegli la tua identità di Shanghai" },
    PT: { login: 'Entrar', register: 'Registrar', email: 'Email', password: 'Senha', confirm: 'Confirmar senha', submit: 'Continuar', switchLogin: 'Já tem conta? Entrar', switchRegister: "Não tem conta? Registrar", pickIdentity: "Escolha sua identidade de Xangai" },
    RU: { login: 'Войти', register: 'Регистрация', email: 'Email', password: 'Пароль', confirm: 'Подтвердите пароль', submit: 'Продолжить', switchLogin: 'Уже есть аккаунт? Войти', switchRegister: "Нет аккаунта? Регистрация", pickIdentity: "Выберите свою шанхайскую идентичность" },
    AR: { login: 'تسجيل الدخول', register: 'تسجيل', email: 'البريد الإلكتروني', password: 'كلمة المرور', confirm: 'تأكيد كلمة المرور', submit: 'متابعة', switchLogin: 'هل لديك حساب؟ تسجيل الدخول', switchRegister: "ليس لديك حساب؟ تسجيل", pickIdentity: "اختر هويتك في شنغهاي" }
  };

  const currentT = t[lang] || t['EN'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6fcf9] dark:bg-[#0a140f] p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[20%] left-[-10%] size-72 bg-primary/15 blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] right-[-10%] size-60 bg-blue-400/10 blur-[80px] animate-blob" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-8 relative z-10 border border-white/50 dark:border-white/5">
        <div className="flex flex-col items-center mb-8">
          <div className="size-20 bg-primary/20 rounded-[1.5rem] flex items-center justify-center mb-4 rotate-3">
            <span className="text-4xl">🏙️</span>
          </div>
          <h1 className="text-3xl font-black text-[#0d1b14] dark:text-white tracking-tighter italic">we Link!</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">{isLogin ? currentT.login : currentT.register}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-2">{currentT.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-[#0d1b14] dark:text-white placeholder-slate-300"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-2">{currentT.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-[#0d1b14] dark:text-white placeholder-slate-300"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-2">{currentT.confirm}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-[#0d1b14] dark:text-white placeholder-slate-300"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 ml-2 text-center">{currentT.pickIdentity}</label>
                <div className="flex justify-between px-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.name}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.name)}
                      className={`size-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                        selectedAvatar === avatar.name
                          ? 'bg-primary/20 scale-110 border-2 border-primary shadow-lg shadow-primary/20'
                          : 'bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 scale-100 border border-transparent'
                      }`}
                      title={avatar.name}
                    >
                      {avatar.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-500/20">
              <p className="text-xs font-bold text-rose-500 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-primary text-[#0d1b14] font-black rounded-[2rem] shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Processing...' : currentT.submit}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            {isLogin ? currentT.switchRegister : currentT.switchLogin}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
