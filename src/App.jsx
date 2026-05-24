import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, SuperadminRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

import QuizList from './pages/quizzes/QuizList'
import QuizCreate from './pages/quizzes/QuizCreate'
import QuizEdit from './pages/quizzes/QuizEdit'
import QuizDetail from './pages/quizzes/QuizDetail'

import QuestionList from './pages/questions/QuestionList'
import QuestionCreate from './pages/questions/QuestionCreate'
import QuestionEdit from './pages/questions/QuestionEdit'

import AdminList from './pages/superadmin/AdminList'
import AdminCreate from './pages/superadmin/AdminCreate'
import AdminDetail from './pages/superadmin/AdminDetail'

import PublicQuizList from './pages/public/PublicQuizList'
import PublicQuizTake from './pages/public/PublicQuizTake'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
          <Route path="/quizzes/create" element={<ProtectedRoute><QuizCreate /></ProtectedRoute>} />
          <Route path="/quizzes/:id" element={<ProtectedRoute><QuizDetail /></ProtectedRoute>} />
          <Route path="/quizzes/:id/edit" element={<ProtectedRoute><QuizEdit /></ProtectedRoute>} />

          <Route path="/questions" element={<ProtectedRoute><QuestionList /></ProtectedRoute>} />
          <Route path="/questions/create" element={<ProtectedRoute><QuestionCreate /></ProtectedRoute>} />
          <Route path="/questions/:id/edit" element={<ProtectedRoute><QuestionEdit /></ProtectedRoute>} />

          <Route path="/superadmin/admins" element={<SuperadminRoute><AdminList /></SuperadminRoute>} />
          <Route path="/superadmin/admins/create" element={<SuperadminRoute><AdminCreate /></SuperadminRoute>} />
          <Route path="/superadmin/admins/:id" element={<SuperadminRoute><AdminDetail /></SuperadminRoute>} />

          {/* Public quiz routes — no auth required */}
          <Route path="/quiz" element={<PublicQuizList />} />
          <Route path="/quiz/:id" element={<PublicQuizTake />} />

          <Route path="/" element={<Navigate to="/quiz" replace />} />
          <Route path="*" element={<Navigate to="/quiz" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
