# Skofie - Financial Education Platform for Gen Z 📚

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Saefulismail01/skofie?style=social)](https://github.com/Saefulismail01/skofie/stargazers)

Skofie is a modern financial education platform designed specifically for Generation Z, providing accessible and engaging financial literacy courses to help young adults manage their money effectively.

## 🚀 Features

- 📚 Interactive financial literacy courses
- 🎓 Learn at your own pace
- 💰 Budgeting and investment tutorials
- 🏆 Earn badges and track progress
- 📱 Responsive design for all devices

## 🛠 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls

### Backend
- FastAPI
- MongoDB (Database)
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- Python (v3.8 or later)
- MongoDB (v4.4 or later)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Saefulismail01/skofie.git
   cd skofie
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   - Create a `.env` file in the `backend` directory with the following:
     ```
     MONGO_URL=mongodb://localhost:27017
     DB_NAME=skofie
     JWT_SECRET=your_jwt_secret_here
     ```
   - Create a `.env` file in the `frontend` directory with your API URL

5. **Running the application**
   - Start the backend:
     ```bash
     cd backend
     uvicorn server:app --reload
     ```
   - Start the frontend:
     ```bash
     cd frontend
     npm start
     ```

## 📚 Project Structure

```
skofie/
├── backend/               # Backend server code
│   ├── server.py         # Main FastAPI application
│   └── requirements.txt  # Python dependencies
└── frontend/             # Frontend React application
    ├── public/           # Static files
    └── src/              # React components and pages
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All contributors who have helped shape this project
- Icons from [Font Awesome](https://fontawesome.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
