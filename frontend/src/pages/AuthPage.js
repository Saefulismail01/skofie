import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success('Login berhasil! Selamat datang kembali 🎉');
          navigate('/dashboard');
        } else {
          toast.error(result.error);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Password dan konfirmasi password tidak sama');
          return;
        }
        
        if (formData.password.length < 6) {
          toast.error('Password minimal 6 karakter');
          return;
        }

        const result = await register(formData.email, formData.password, formData.fullName);
        if (result.success) {
          toast.success('Registrasi berhasil! Selamat datang di Skofie 🚀');
          navigate('/dashboard');
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan, coba lagi ya!');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              G
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2" data-testid="auth-title">
            {isLogin ? 'Selamat Datang Kembali!' : 'Join Skofie Community'}
          </h2>
          <p className="text-gray-600" data-testid="auth-subtitle">
            {isLogin 
              ? 'Login untuk lanjut belajar financial literacy' 
              : 'Mulai journey financial literacy-mu sekarang'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="glass-effect shadow-xl border-0" data-testid="auth-form">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    className="focus-ring h-12"
                    required
                    data-testid="fullname-input"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                  className="focus-ring h-12"
                  required
                  data-testid="email-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className="focus-ring h-12"
                  required
                  data-testid="password-input"
                />
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Konfirmasi Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Konfirmasi password"
                    className="focus-ring h-12"
                    required
                    data-testid="confirm-password-input"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-primary text-lg font-semibold"
                disabled={loading}
                data-testid="auth-submit-button"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Masuk...' : 'Mendaftar...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} mr-2`}></i>
                    {isLogin ? 'Masuk' : 'Daftar'}
                  </>
                )}
              </Button>
            </form>
            
            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                <button 
                  onClick={toggleMode}
                  className="ml-2 font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                  data-testid="toggle-auth-mode"
                >
                  {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                </button>
              </p>
            </div>
            
            {/* Social Login Placeholder */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">atau</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-4 h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled
                data-testid="google-login-placeholder"
              >
                <i className="fab fa-google mr-2 text-red-500"></i>
                Lanjutkan dengan Google
                <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Demo Account Info */}
        <Card className="glass-effect border border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-emerald-800 mb-2">
                🚀 Demo Account untuk Testing
              </h3>
              <div className="text-xs text-emerald-700 space-y-1">
                <p><strong>Admin:</strong> admin@genmoney.com / admin123</p>
                <p><strong>User:</strong> Daftar akun baru atau gunakan email apapun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
