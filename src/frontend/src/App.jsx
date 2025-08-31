import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SubmitIssue from './pages/SubmitIssue';
import MyIssues from './pages/MyIssues';
import EscalatedIssues from './pages/EscalatedIssues';
import IssueManagement from './pages/IssueManagement';
import IssueDetail from './pages/IssueDetailTemp';
import PublicIssues from './pages/PublicIssues';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/public-issues" element={<PublicIssues />} />
                  <Route path="/issue/:id" element={<IssueDetail />} />
                  <Route path="/submit-issue" element={<SubmitIssue />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-issues" element={
                    <ProtectedRoute>
                      <MyIssues />
                    </ProtectedRoute>
                  } />
                  <Route path="/escalated-issues" element={
                    <ProtectedRoute>
                      <EscalatedIssues />
                    </ProtectedRoute>
                  } />
                  <Route path="/manage-issues" element={
                    <ProtectedRoute>
                      <IssueManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;