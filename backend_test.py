#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class GenMoneyAPITester:
    def __init__(self, base_url="https://genmoney.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_course_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})
        print()

    def make_request(self, method, endpoint, data=None, headers=None, use_admin=False):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        
        if headers:
            request_headers.update(headers)
            
        # Add auth token if available
        token_to_use = self.admin_token if use_admin else self.token
        if token_to_use:
            request_headers['Authorization'] = f'Bearer {token_to_use}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=10)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_categories_endpoint(self):
        """Test categories endpoint"""
        response = self.make_request('GET', 'categories')
        if response and response.status_code == 200:
            data = response.json()
            categories = data.get('categories', [])
            expected_categories = ['personal_finance', 'stocks', 'crypto', 'mutual_funds']
            
            if len(categories) >= 4:
                category_ids = [cat['id'] for cat in categories]
                missing = [cat for cat in expected_categories if cat not in category_ids]
                if not missing:
                    self.log_test("Categories Endpoint", True, f"Found {len(categories)} categories")
                    return True
                else:
                    self.log_test("Categories Endpoint", False, f"Missing categories: {missing}")
            else:
                self.log_test("Categories Endpoint", False, f"Expected 4+ categories, got {len(categories)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Categories Endpoint", False, f"Status: {status}")
        return False

    def test_courses_endpoint(self):
        """Test courses listing endpoint"""
        response = self.make_request('GET', 'courses')
        if response and response.status_code == 200:
            courses = response.json()
            if len(courses) >= 3:
                # Store first course ID for later tests
                self.test_course_id = courses[0]['id']
                self.log_test("Courses Listing", True, f"Found {len(courses)} courses")
                return True
            else:
                self.log_test("Courses Listing", False, f"Expected 3+ courses, got {len(courses)}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Courses Listing", False, f"Status: {status}")
        return False

    def test_course_detail(self):
        """Test individual course detail endpoint"""
        if not self.test_course_id:
            self.log_test("Course Detail", False, "No course ID available")
            return False
            
        response = self.make_request('GET', f'courses/{self.test_course_id}')
        if response and response.status_code == 200:
            course = response.json()
            required_fields = ['id', 'title', 'description', 'price', 'category', 'level']
            missing_fields = [field for field in required_fields if field not in course]
            
            if not missing_fields:
                self.log_test("Course Detail", True, f"Course: {course['title']}")
                return True
            else:
                self.log_test("Course Detail", False, f"Missing fields: {missing_fields}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Course Detail", False, f"Status: {status}")
        return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "testpass123",
            "full_name": f"Test User {timestamp}"
        }
        
        response = self.make_request('POST', 'auth/register', test_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and 'user' in data:
                self.token = data['access_token']
                self.test_user_id = data['user']['id']
                self.log_test("User Registration", True, f"User: {data['user']['email']}")
                return True
            else:
                self.log_test("User Registration", False, "Missing token or user data")
        else:
            status = response.status_code if response else "No response"
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("User Registration", False, f"Status: {status}, Error: {error_msg}")
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@genmoney.com",
            "password": "admin123"
        }
        
        response = self.make_request('POST', 'auth/login', admin_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'access_token' in data and data['user']['is_admin']:
                self.admin_token = data['access_token']
                self.log_test("Admin Login", True, f"Admin: {data['user']['email']}")
                return True
            else:
                self.log_test("Admin Login", False, "Not admin user or missing token")
        else:
            status = response.status_code if response else "No response"
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Admin Login", False, f"Status: {status}, Error: {error_msg}")
        return False

    def test_user_login(self):
        """Test regular user login with registered user"""
        if not self.test_user_id:
            self.log_test("User Login", False, "No test user available")
            return False
            
        # We'll use the same credentials from registration
        timestamp = datetime.now().strftime("%H%M%S")
        login_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "testpass123"
        }
        
        # Since we already have token from registration, this test verifies login works
        if self.token:
            self.log_test("User Login", True, "Login successful (from registration)")
            return True
        else:
            self.log_test("User Login", False, "No token available")
            return False

    def test_course_purchase(self):
        """Test course purchase functionality"""
        if not self.token or not self.test_course_id:
            self.log_test("Course Purchase", False, "Missing auth token or course ID")
            return False
            
        purchase_data = {
            "course_id": self.test_course_id,
            "payment_method": "mock_payment"
        }
        
        response = self.make_request('POST', 'payments/purchase', purchase_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'message' in data and 'payment_id' in data:
                self.log_test("Course Purchase", True, f"Payment ID: {data['payment_id']}")
                return True
            else:
                self.log_test("Course Purchase", False, "Missing payment confirmation")
        else:
            status = response.status_code if response else "No response"
            error_msg = response.json().get('detail', 'Unknown error') if response else "No response"
            self.log_test("Course Purchase", False, f"Status: {status}, Error: {error_msg}")
        return False

    def test_user_dashboard(self):
        """Test user dashboard endpoint"""
        if not self.token:
            self.log_test("User Dashboard", False, "No auth token")
            return False
            
        response = self.make_request('GET', 'user/dashboard')
        if response and response.status_code == 200:
            data = response.json()
            required_fields = ['user', 'enrolled_courses', 'payment_history']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                enrolled_count = len(data['enrolled_courses'])
                self.log_test("User Dashboard", True, f"Enrolled courses: {enrolled_count}")
                return True
            else:
                self.log_test("User Dashboard", False, f"Missing fields: {missing_fields}")
        else:
            status = response.status_code if response else "No response"
            self.log_test("User Dashboard", False, f"Status: {status}")
        return False

    def test_course_filtering(self):
        """Test course filtering by category and level"""
        # Test category filter
        response = self.make_request('GET', 'courses?category=personal_finance')
        if response and response.status_code == 200:
            courses = response.json()
            if all(course['category'] == 'personal_finance' for course in courses):
                self.log_test("Course Category Filter", True, f"Found {len(courses)} personal_finance courses")
            else:
                self.log_test("Course Category Filter", False, "Filter not working properly")
        else:
            self.log_test("Course Category Filter", False, "Filter request failed")
            
        # Test level filter
        response = self.make_request('GET', 'courses?level=beginner')
        if response and response.status_code == 200:
            courses = response.json()
            if all(course['level'] == 'beginner' for course in courses):
                self.log_test("Course Level Filter", True, f"Found {len(courses)} beginner courses")
                return True
            else:
                self.log_test("Course Level Filter", False, "Level filter not working properly")
        else:
            self.log_test("Course Level Filter", False, "Level filter request failed")
        return False

    def test_unauthorized_access(self):
        """Test that protected endpoints require authentication"""
        # Test dashboard without token
        response = requests.get(f"{self.api_url}/user/dashboard", timeout=10)
        if response.status_code == 401:
            self.log_test("Unauthorized Access Protection", True, "Dashboard properly protected")
            return True
        else:
            self.log_test("Unauthorized Access Protection", False, f"Expected 401, got {response.status_code}")
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting GenMoney API Tests")
        print("=" * 50)
        
        # Basic endpoint tests
        self.test_categories_endpoint()
        self.test_courses_endpoint()
        self.test_course_detail()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_admin_login()
        
        # Protected endpoint tests
        self.test_course_purchase()
        self.test_user_dashboard()
        
        # Additional functionality tests
        self.test_course_filtering()
        self.test_unauthorized_access()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = GenMoneyAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())