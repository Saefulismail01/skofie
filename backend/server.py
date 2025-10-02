from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="GenMoney API", description="Financial Education Platform for Gen Z")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "genmoney-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    enrolled_courses: List[str] = Field(default_factory=list)
    badges: List[str] = Field(default_factory=list)
    progress: dict = Field(default_factory=dict)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Course Models
class CourseCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str  # personal_finance, stocks, crypto, mutual_funds
    level: str  # beginner, intermediate, advanced
    mentor_name: str
    video_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    duration: str  # e.g., "2 hours"
    topics: List[str] = Field(default_factory=list)

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    category: str
    level: str
    mentor_name: str
    video_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    duration: str
    topics: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    enrolled_count: int = 0

# Payment Models
class PaymentCreate(BaseModel):
    course_id: str
    payment_method: str  # mock_payment, gopay, ovo, bank_transfer

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    amount: float
    payment_method: str
    status: str = "completed"  # For MVP, all payments are successful
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_dict = {
        **user_data.dict(exclude={"password"}),
        "password_hash": hashed_password,
        "id": str(uuid.uuid4()),
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "enrolled_courses": [],
        "badges": [],
        "progress": {}
    }
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["id"]}, expires_delta=access_token_expires
    )
    
    user = User(**{k: v for k, v in user_dict.items() if k != "password_hash"})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    user_obj = User(**{k: v for k, v in user.items() if k != "password_hash"})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

# Course Routes
@api_router.get("/courses", response_model=List[Course])
async def get_courses(category: Optional[str] = None, level: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if level:
        query["level"] = level
    
    courses = await db.courses.find(query).to_list(1000)
    return [Course(**course) for course in courses]

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)

@api_router.post("/courses", response_model=Course)
async def create_course(course_data: CourseCreate, admin_user: User = Depends(get_admin_user)):
    course_dict = course_data.dict()
    course_dict.update({
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "enrolled_count": 0
    })
    
    await db.courses.insert_one(course_dict)
    return Course(**course_dict)

# Payment Routes
@api_router.post("/payments/purchase", response_model=dict)
async def purchase_course(payment_data: PaymentCreate, current_user: User = Depends(get_current_user)):
    # Get course details
    course = await db.courses.find_one({"id": payment_data.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    if payment_data.course_id in current_user.enrolled_courses:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create payment record (mock success for MVP)
    payment_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "course_id": payment_data.course_id,
        "amount": course["price"],
        "payment_method": payment_data.payment_method,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payments.insert_one(payment_dict)
    
    # Update user's enrolled courses
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"enrolled_courses": payment_data.course_id}}
    )
    
    # Update course enrollment count
    await db.courses.update_one(
        {"id": payment_data.course_id},
        {"$inc": {"enrolled_count": 1}}
    )
    
    return {
        "message": "Course purchased successfully!",
        "payment_id": payment_dict["id"],
        "course_title": course["title"]
    }

# User Dashboard Routes
@api_router.get("/user/dashboard", response_model=dict)
async def get_user_dashboard(current_user: User = Depends(get_current_user)):
    # Get enrolled courses
    enrolled_courses = []
    if current_user.enrolled_courses:
        courses_cursor = db.courses.find({"id": {"$in": current_user.enrolled_courses}})
        enrolled_courses = await courses_cursor.to_list(1000)
    
    # Get payment history
    payments_cursor = db.payments.find({"user_id": current_user.id})
    payments = await payments_cursor.to_list(1000)
    
    return {
        "user": current_user,
        "enrolled_courses": [Course(**course) for course in enrolled_courses],
        "payment_history": [Payment(**payment) for payment in payments],
        "badges": current_user.badges,
        "total_spent": sum(payment["amount"] for payment in payments)
    }

# Categories endpoint
@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            {
                "id": "personal_finance",
                "name": "Personal Finance",
                "description": "Atur keuangan pribadi dengan smart",
                "icon": "💰",
                "color": "bg-emerald-500"
            },
            {
                "id": "stocks",
                "name": "Saham & Investasi",
                "description": "Mulai investasi saham dari nol",
                "icon": "📈",
                "color": "bg-blue-500"
            },
            {
                "id": "crypto",
                "name": "Crypto & Blockchain",
                "description": "Pahami dunia crypto dengan aman",
                "icon": "₿",
                "color": "bg-orange-500"
            },
            {
                "id": "mutual_funds",
                "name": "Reksa Dana",
                "description": "Investasi mudah untuk pemula",
                "icon": "🏦",
                "color": "bg-purple-500"
            }
        ]
    }

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create sample admin user if not exists
    admin_email = "admin@genmoney.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_dict = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "full_name": "Admin GenMoney",
            "password_hash": hash_password("admin123"),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "enrolled_courses": [],
            "badges": [],
            "progress": {}
        }
        await db.users.insert_one(admin_dict)
        logger.info("Admin user created: admin@genmoney.com / admin123")
    
    # Create sample courses if not exist
    courses_count = await db.courses.count_documents({})
    if courses_count == 0:
        sample_courses = [
            {
                "id": str(uuid.uuid4()),
                "title": "Financial Planning 101: Gaji Gak Numpang Lewat",
                "description": "Belajar ngatur duit biar gak habis di awal bulan. Cocok banget buat yang baru kerja!",
                "price": 199000,
                "category": "personal_finance",
                "level": "beginner",
                "mentor_name": "Sarah Wijaya",
                "duration": "2.5 jam",
                "topics": ["Budgeting", "Emergency Fund", "Debt Management", "Savings Goals"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "enrolled_count": 0
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Saham untuk Pemula: Investasi Tanpa Drama",
                "description": "Mulai investasi saham dengan strategi yang proven. No FOMO, no stress!",
                "price": 299000,
                "category": "stocks",
                "level": "beginner",
                "mentor_name": "Rizky Pratama",
                "duration": "3 jam",
                "topics": ["Stock Basics", "Company Analysis", "Risk Management", "Portfolio Building"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "enrolled_count": 0
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Crypto 101: Blockchain Buat Gen Z",
                "description": "Pahami crypto dan blockchain technology. Investasi cerdas, bukan gambling!",
                "price": 249000,
                "category": "crypto",
                "level": "intermediate",
                "mentor_name": "Alex Chen",
                "duration": "2 jam",
                "topics": ["Blockchain Basics", "DeFi", "NFTs", "Crypto Trading"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "enrolled_count": 0
            }
        ]
        await db.courses.insert_many(sample_courses)
        logger.info(f"Created {len(sample_courses)} sample courses")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
