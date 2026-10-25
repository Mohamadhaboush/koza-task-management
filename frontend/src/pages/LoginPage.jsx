import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api/auth';
import './LoginPage.css';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    companyName: '',
    companySlug: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // companyName'den otomatik slug üret
  const handleCompanyNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setForm({ ...form, companyName: name, companySlug: slug });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await login({
          companySlug: form.companySlug,
          email: form.email,
          password: form.password,
        });
        signIn(res.data.token, res.data.user);
      } else {
        const res = await register({
          companyName: form.companyName,
          companySlug: form.companySlug,
          email: form.email,
          password: form.password,
        });
        // Kayıt başarılı → otomatik login
        const loginRes = await login({
          companySlug: form.companySlug,
          email: form.email,
          password: form.password,
        });
        signIn(loginRes.data.token, loginRes.data.user);
      }
    } catch (err) {
      const data = err.response?.data;
      // Backend validation array döndürüyorsa ilk hatayı göster
      const msg =
        Array.isArray(data?.errors) && data.errors.length > 0
          ? data.errors.map((e) => e.msg).join(' | ')
          : data?.message || (mode === 'login' ? 'Giriş başarısız.' : 'Kayıt başarısız.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setForm({ companyName: '', companySlug: '', email: '', password: '' });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="logo-icon">🦋</span>
          <span className="logo-text">Koza</span>
        </div>
        <p className="login-tagline">Fikirler ve görevler Koza'da olgunlaşır.</p>
        <h2 className="login-title">
          {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Şirket Adı</label>
              <input
                type="text"
                name="companyName"
                placeholder="Şirket Adı"
                value={form.companyName}
                onChange={handleCompanyNameChange}
                required
                autoComplete="off"
              />
            </div>
          )}

          <div className="form-group">
            <label>{mode === 'login' ? 'Şirket' : 'Şirket Slug'}</label>
            <input
              type="text"
              name="companySlug"
              placeholder="sirket-adi"
              value={form.companySlug}
              onChange={handleChange}
              required
              autoComplete="off"
            />
            {mode === 'register' && form.companySlug && (
              <span className="slug-preview">/{form.companySlug}</span>
            )}
          </div>

          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              name="email"
              placeholder="ad@sirket.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? mode === 'login'
                ? 'Giriş yapılıyor...'
                : 'Kayıt olunuyor...'
              : mode === 'login'
              ? 'Giriş Yap'
              : 'Kayıt Ol'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? (
            <>
              Hesabınız yok mu?{' '}
              <button onClick={switchMode} className="switch-btn">
                Kayıt Ol
              </button>
            </>
          ) : (
            <>
              Zaten hesabınız var mı?{' '}
              <button onClick={switchMode} className="switch-btn">
                Giriş Yap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
