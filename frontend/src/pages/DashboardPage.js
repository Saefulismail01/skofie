import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API}/user/dashboard`);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getBadgeColor = (badge) => {
    const colors = {
      'first_course': 'bg-blue-100 text-blue-700',
      'quick_learner': 'bg-green-100 text-green-700',
      'consistent': 'bg-purple-100 text-purple-700',
      'finance_master': 'bg-yellow-100 text-yellow-700'
    };
    return colors[badge] || 'bg-gray-100 text-gray-700';
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      'first_course': '🎓',
      'quick_learner': '⚡',
      'consistent': '🎯',
      'finance_master': '👑'
    };
    return icons[badge] || '🏆';
  };

  const getBadgeName = (badge) => {
    const names = {
      'first_course': 'First Course',
      'quick_learner': 'Quick Learner',
      'consistent': 'Consistent Learner',
      'finance_master': 'Finance Master'
    };
    return names[badge] || badge;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
                Halo, {user?.full_name}! 👋
              </h1>
              <p className="text-gray-600 mt-1" data-testid="dashboard-subtitle">
                Selamat datang kembali di journey financial literacy-mu
              </p>
            </div>
            
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-emerald-100 text-emerald-600 font-semibold text-xl">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kelas Diambil</p>
                    <p className="text-2xl font-bold text-emerald-600" data-testid="enrolled-courses-count">
                      {dashboardData?.enrolled_courses?.length || 0}
                    </p>
                  </div>
                  <i className="fas fa-book text-emerald-500 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                    <p className="text-2xl font-bold text-emerald-600" data-testid="badges-count">
                      {dashboardData?.user?.badges?.length || 0}
                    </p>
                  </div>
                  <i className="fas fa-medal text-emerald-500 text-xl"></i>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {dashboardData?.enrolled_courses?.length > 0 ? '75%' : '0%'}
                    </p>
                  </div>
                  <i className="fas fa-chart-line text-emerald-500 text-xl"></i>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="courses" data-testid="courses-tab">Kelas Saya</TabsTrigger>
            <TabsTrigger value="badges" data-testid="badges-tab">Badges</TabsTrigger>
            <TabsTrigger value="history" data-testid="history-tab">History</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6" data-testid="courses-tab-content">
            {dashboardData?.enrolled_courses?.length === 0 ? (
              <Card className="glass-effect">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Belum Ada Kelas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Yuk mulai journey financial literacy-mu dengan pilih kelas pertama!
                  </p>
                  <Link to="/courses">
                    <Button className="btn-primary" data-testid="browse-courses-btn">
                      <i className="fas fa-search mr-2"></i>
                      Browse Kelas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {dashboardData.enrolled_courses.map((course) => (
                  <Card key={course.id} className="card-hover" data-testid={`enrolled-course-${course.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Progress</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <i className="fas fa-user mr-1"></i>
                          {course.mentor_name}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock mr-1"></i>
                          {course.duration}
                        </div>
                      </div>
                      
                      <Link to={`/course/${course.id}`}>
                        <Button className="w-full mt-4 btn-primary">
                          <i className="fas fa-play mr-2"></i>
                          Lanjut Belajar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6" data-testid="badges-tab-content">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-medal mr-2 text-emerald-600"></i>
                  Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.user?.badges?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Belum Ada Badge
                    </h3>
                    <p className="text-gray-600">
                      Selesaikan kelas untuk mendapatkan badge pertamamu!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.user.badges.map((badge, index) => (
                      <div key={index} className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-2xl mr-3">
                          {getBadgeIcon(badge)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {getBadgeName(badge)}
                          </h4>
                          <Badge className={getBadgeColor(badge)}>
                            Achievement
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Available Badges */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Badges</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'first_course', name: 'First Course', desc: 'Complete your first course' },
                      { id: 'quick_learner', name: 'Quick Learner', desc: 'Complete a course in 1 week' },
                      { id: 'consistent', name: 'Consistent Learner', desc: 'Learn for 7 days straight' },
                      { id: 'finance_master', name: 'Finance Master', desc: 'Complete 5 courses' }
                    ].map((badge) => (
                      <div key={badge.id} className={`p-4 rounded-xl border-2 border-dashed ${
                        dashboardData?.user?.badges?.includes(badge.id) 
                          ? 'border-emerald-300 bg-emerald-50' 
                          : 'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl mb-2 opacity-50">
                            {getBadgeIcon(badge.id)}
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 mb-1">
                            {badge.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {badge.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6" data-testid="history-tab-content">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-history mr-2 text-emerald-600"></i>
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.payment_history?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Belum Ada Transaksi
                    </h3>
                    <p className="text-gray-600">
                      History pembelian kelas akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData.payment_history.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100" data-testid={`payment-${payment.id}`}>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                            <i className="fas fa-credit-card text-emerald-600"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Course Purchase
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            Rp {payment.amount.toLocaleString('id-ID')}
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="glass-effect mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/courses">
                <Button variant="outline" className="w-full h-16 flex-col" data-testid="browse-all-courses">
                  <i className="fas fa-search text-xl mb-2"></i>
                  <span>Browse Semua Kelas</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full h-16 flex-col" disabled>
                <i className="fas fa-users text-xl mb-2"></i>
                <span>Join Komunitas</span>
              </Button>
              
              <Button variant="outline" className="w-full h-16 flex-col" disabled>
                <i className="fas fa-question-circle text-xl mb-2"></i>
                <span>Help & Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;