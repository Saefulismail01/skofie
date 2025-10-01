import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, coursesRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/courses`)
        ]);
        
        setCategories(categoriesRes.data.categories);
        setFeaturedCourses(coursesRes.data.slice(0, 3)); // Get first 3 courses
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroImages = [
    "https://images.unsplash.com/photo-1758691737387-a89bb8adf768",
    "https://images.pexels.com/photos/5716031/pexels-photo-5716031.jpeg",
    "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg"
  ];

  const categoryImages = {
    personal_finance: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd",
    stocks: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74",
    crypto: "https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg",
    mutual_funds: "https://images.unsplash.com/photo-1633158829875-e5316a358c6f"
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 lg:py-32">
        <div className="absolute inset-0 bg-white/40"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-200" data-testid="hero-badge">
                🚀 Platform edukasi keuangan #1 untuk Gen Z
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" data-testid="hero-title">
                <span className="gradient-text">Belajar Keuangan</span><br />
                <span className="text-gray-800">Tanpa Ribet!</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0" data-testid="hero-description">
                Gaji jangan cuma numpang lewat! Belajar atur duit, investasi, dan financial planning 
                dengan cara yang fun dan gak bikin pusing. Khusus buat Gen Z yang udah punya penghasilan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/courses">
                  <Button 
                    size="lg" 
                    className="btn-primary text-lg px-8 py-4 w-full sm:w-auto group"
                    data-testid="cta-mulai-belajar"
                  >
                    <i className="fas fa-play mr-2 group-hover:animate-pulse"></i>
                    Mulai Belajar Sekarang
                  </Button>
                </Link>
                
                <Link to="/courses">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto group"
                    data-testid="cta-lihat-kelas"
                  >
                    <i className="fas fa-search mr-2 group-hover:scale-110 transition-transform"></i>
                    Lihat Semua Kelas
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600" data-testid="stat-students">1000+</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600" data-testid="stat-courses">50+</div>
                  <div className="text-sm text-gray-500">Kelas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600" data-testid="stat-rating">4.8/5</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-float">
              <div className="relative z-10">
                <img 
                  src={heroImages[0]} 
                  alt="Gen Z learning finance" 
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                  data-testid="hero-image"
                />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl animate-pulse-subtle">
                  💰
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl animate-pulse-subtle" style={{ animationDelay: '1s' }}>
                  📈
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white" data-testid="categories-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="categories-title">
              Pilih Kategori Pembelajaran
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="categories-description">
              Dari basic personal finance sampai advanced trading. Semua ada di sini!
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-48"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link key={category.id} to={`/courses?category=${category.id}`}>
                  <Card className="card-hover group cursor-pointer h-full" data-testid={`category-${category.id}`}>
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <img 
                          src={categoryImages[category.id]} 
                          alt={category.name}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute top-4 left-4 text-2xl">
                          {category.icon}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {category.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50" data-testid="featured-courses-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="featured-courses-title">
              Kelas Terpopuler
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="featured-courses-description">
              Kelas yang paling banyak diambil sama Gen Z lainnya
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <Card className="card-hover group cursor-pointer h-full" data-testid={`featured-course-${course.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge 
                          variant="secondary" 
                          className={`
                            ${course.level === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                            ${course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${course.level === 'advanced' ? 'bg-red-100 text-red-700' : ''}
                          `}
                        >
                          {course.level}
                        </Badge>
                        <span className="text-2xl font-bold text-emerald-600">
                          Rp {course.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <i className="fas fa-user mr-1"></i>
                          {course.mentor_name}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock mr-1"></i>
                          {course.duration}
                        </div>
                      </div>
                      
                      <Button className="w-full btn-primary group-hover:shadow-lg">
                        <i className="fas fa-play mr-2"></i>
                        Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/courses">
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary"
                data-testid="view-all-courses"
              >
                Lihat Semua Kelas
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" data-testid="cta-section">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" data-testid="cta-title">
            Siap Mulai Journey Financial Literasi?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto" data-testid="cta-description">
            Join ribuan Gen Z lainnya yang udah mulai ngatur keuangan dengan smart. 
            Yuk, jangan sampai gaji cuma numpang lewat!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="cta-start-learning"
              >
                <i className="fas fa-rocket mr-2"></i>
                Mulai Belajar Gratis
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-emerald-600 font-semibold px-8 py-4 text-lg w-full sm:w-auto"
                data-testid="cta-register"
              >
                <i className="fas fa-user-plus mr-2"></i>
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
