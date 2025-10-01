import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mock_payment');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${API}/courses/${id}`);
        setCourse(response.data);
        
        // Check if user is enrolled
        if (user && user.enrolled_courses) {
          setIsEnrolled(user.enrolled_courses.includes(id));
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        if (error.response?.status === 404) {
          navigate('/courses');
          toast.error('Kelas tidak ditemukan');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id, user, navigate]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }

    if (isEnrolled) {
      toast.info('Anda sudah terdaftar di kelas ini');
      return;
    }

    setPurchasing(true);
    
    try {
      const response = await axios.post(`${API}/payments/purchase`, {
        course_id: id,
        payment_method: paymentMethod
      });
      
      toast.success(`Pembelian berhasil! ${response.data.message}`);
      setIsEnrolled(true);
      
      // Update user data in context
      const updatedUser = {
        ...user,
        enrolled_courses: [...(user.enrolled_courses || []), id]
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.detail || 'Gagal melakukan pembelian');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kelas tidak ditemukan</h2>
          <Button onClick={() => navigate('/courses')}>Kembali ke Semua Kelas</Button>
        </div>
      </div>
    );
  }

  const categoryImages = {
    personal_finance: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd",
    stocks: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74",
    crypto: "https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg",
    mutual_funds: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <Card className="glass-effect mb-6" data-testid="course-header">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={categoryImages[course.category] || categoryImages.personal_finance}
                    alt={course.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-t-2xl"
                    data-testid="course-image"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-t-2xl"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={`
                        ${course.level === 'beginner' ? 'bg-green-600 text-white' : ''}
                        ${course.level === 'intermediate' ? 'bg-yellow-600 text-white' : ''}
                        ${course.level === 'advanced' ? 'bg-red-600 text-white' : ''}
                      `}>
                        {course.level}
                      </Badge>
                      {isEnrolled && (
                        <Badge className="bg-emerald-600 text-white">
                          🎉 Sudah Terdaftar
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" data-testid="course-title">
                      {course.title}
                    </h1>
                    <div className="flex items-center text-white/90 text-sm">
                      <i className="fas fa-user mr-2"></i>
                      <span className="mr-4">{course.mentor_name}</span>
                      <i className="fas fa-clock mr-2"></i>
                      <span className="mr-4">{course.duration}</span>
                      {course.enrolled_count > 0 && (
                        <>
                          <i className="fas fa-users mr-2"></i>
                          <span>{course.enrolled_count} siswa</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Description */}
            <Card className="glass-effect mb-6" data-testid="course-description">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle mr-2 text-emerald-600"></i>
                  Deskripsi Kelas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {/* Course Topics */}
            {course.topics && course.topics.length > 0 && (
              <Card className="glass-effect mb-6" data-testid="course-topics">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-list-ul mr-2 text-emerald-600"></i>
                    Yang Akan Kamu Pelajari
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.topics.map((topic, index) => (
                      <div key={index} className="flex items-center">
                        <i className="fas fa-check-circle text-emerald-500 mr-3"></i>
                        <span className="text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mentor Info */}
            <Card className="glass-effect" data-testid="mentor-info">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-chalkboard-teacher mr-2 text-emerald-600"></i>
                  Tentang Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 flex-shrink-0">
                    {course.mentor_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {course.mentor_name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Expert di bidang financial planning dengan pengalaman 5+ tahun. 
                      Sudah membantu ribuan Gen Z untuk achieve financial goals mereka.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect sticky top-24" data-testid="purchase-card">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    Rp {course.price.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-600">Akses selamanya</p>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {!isEnrolled ? (
                  <>
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metode Pembayaran
                      </label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger data-testid="payment-method-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mock_payment">
                            🏆 Demo Payment (Instant)
                          </SelectItem>
                          <SelectItem value="gopay" disabled>
                            GoPay (Coming Soon)
                          </SelectItem>
                          <SelectItem value="ovo" disabled>
                            OVO (Coming Soon)
                          </SelectItem>
                          <SelectItem value="bank_transfer" disabled>
                            Bank Transfer (Coming Soon)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    {/* What's Included */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Yang Kamu Dapatkan:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-video text-emerald-500 mr-3 w-4"></i>
                          Video pembelajaran HD
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-infinity text-emerald-500 mr-3 w-4"></i>
                          Akses selamanya
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-certificate text-emerald-500 mr-3 w-4"></i>
                          Sertifikat completion
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-mobile-alt text-emerald-500 mr-3 w-4"></i>
                          Akses di mobile & desktop
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <i className="fas fa-comments text-emerald-500 mr-3 w-4"></i>
                          Komunitas diskusi
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Purchase Button */}
                    <Button 
                      onClick={handlePurchase}
                      className="w-full btn-primary h-12 text-lg font-semibold"
                      disabled={purchasing}
                      data-testid="purchase-button"
                    >
                      {purchasing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart mr-2"></i>
                          Beli Kelas Sekarang
                        </>
                      )}
                    </Button>
                    
                    {!isAuthenticated && (
                      <p className="text-xs text-center text-gray-500">
                        Kamu akan diminta login sebelum checkout
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-center py-6">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Kamu Sudah Terdaftar!
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Akses video pembelajaran kapan saja di dashboard
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full btn-primary h-12 text-lg font-semibold"
                      data-testid="go-to-dashboard"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Mulai Belajar
                    </Button>
                  </>
                )}
                
                {/* Money Back Guarantee */}
                <div className="text-center py-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    🛡️ 30 hari money-back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
