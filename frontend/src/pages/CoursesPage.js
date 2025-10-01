import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/courses`),
          axios.get(`${API}/categories`)
        ]);
        
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    // Update URL params
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="courses-page-title">
            Semua Kelas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="courses-page-subtitle">
            Pilih kelas yang sesuai dengan level dan kebutuhan financial literacy-mu
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-effect mb-8" data-testid="filters-section">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Input
                  placeholder="Cari kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus-ring"
                  data-testid="search-input"
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="focus-ring" data-testid="category-filter">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Level Filter */}
              <div>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="focus-ring" data-testid="level-filter">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600" data-testid="results-count">
            {loading ? 'Memuat...' : `Menampilkan ${filteredCourses.length} kelas`}
          </p>
          
          {selectedCategory !== 'all' && (
            <Badge className="bg-emerald-100 text-emerald-700" data-testid="active-category-badge">
              Kategori: {getCategoryName(selectedCategory)}
            </Badge>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16" data-testid="no-courses-found">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Kelas tidak ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba ubah filter atau kata kunci pencarian</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLevel('all');
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              variant="outline"
              data-testid="reset-filters-button"
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" data-testid="courses-grid">
            {filteredCourses.map((course, index) => (
              <Link key={course.id} to={`/course/${course.id}`}>
                <Card className="card-hover group cursor-pointer h-full" data-testid={`course-card-${course.id}`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`w-fit ${
                            course.level === 'beginner' ? 'bg-green-100 text-green-700' : 
                            course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className="w-fit text-xs">
                          {getCategoryName(course.category)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          Rp {course.price.toLocaleString('id-ID')}
                        </div>
                        {course.enrolled_count > 0 && (
                          <div className="text-xs text-gray-500">
                            {course.enrolled_count} siswa
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {course.description}
                    </p>
                    
                    {/* Topics */}
                    {course.topics && course.topics.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {course.topics.slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {course.topics.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.topics.length - 3} lainnya
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Footer */}
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
                    
                    {/* CTA Button */}
                    <Button className="w-full btn-primary group-hover:shadow-lg">
                      <i className="fas fa-eye mr-2"></i>
                      Lihat Detail
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!loading && filteredCourses.length > 0 && (
          <div className="text-center py-16 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl">
            <div className="max-w-2xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-white mb-4" data-testid="courses-cta-title">
                Gak Nemu Kelas yang Cocok?
              </h2>
              <p className="text-emerald-100 mb-6" data-testid="courses-cta-description">
                Kita terus nambah kelas baru setiap bulan. Follow social media kita buat update terbaru!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold"
                  data-testid="courses-cta-contact"
                >
                  <i className="fas fa-comments mr-2"></i>
                  Request Kelas Baru
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-emerald-600 font-semibold"
                  data-testid="courses-cta-social"
                >
                  <i className="fab fa-instagram mr-2"></i>
                  Follow Instagram
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
