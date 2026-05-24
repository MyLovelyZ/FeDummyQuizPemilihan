import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (data) => api.post('/login', data)
export const logout = () => api.post('/logout')

// Profile
export const getProfile = () => api.get('/profile')
export const updateProfile = (data) => api.put('/profile', data)
export const deleteProfile = () => api.delete('/profile')

// Quizzes
export const getQuizzes = () => api.get('/admin/quizzes')
export const createQuiz = (data) => api.post('/admin/quizzes', data)
export const getQuiz = (id) => api.get(`/admin/quizzes/${id}`)
export const updateQuiz = (id, data) => api.put(`/admin/quizzes/${id}`, data)
export const deleteQuiz = (id) => api.delete(`/admin/quizzes/${id}`)

// Quiz Grades
export const getQuizGrades = (quizId) => api.get(`/admin/quizzes/${quizId}/grades`)
export const createQuizGrade = (quizId, data) => api.post(`/admin/quizzes/${quizId}/grades`, data)
export const getGrade = (id) => api.get(`/admin/grades/${id}`)
export const updateGrade = (id, data) => api.put(`/admin/grades/${id}`, data)
export const deleteGrade = (id) => api.delete(`/admin/grades/${id}`)

// Questions
export const getQuestions = () => api.get('/admin/questions')
export const createQuestion = (data) => api.post('/admin/questions', data)
export const getQuestion = (id) => api.get(`/admin/questions/${id}`)
export const updateQuestion = (id, data) => api.put(`/admin/questions/${id}`, data)
export const deleteQuestion = (id) => api.delete(`/admin/questions/${id}`)

// Options
export const createOption = (data) => api.post('/admin/options', data)
export const getOption = (id) => api.get(`/admin/options/${id}`)
export const updateOption = (id, data) => api.put(`/admin/options/${id}`, data)
export const deleteOption = (id) => api.delete(`/admin/options/${id}`)

// Superadmin — Admin Management
export const getAdmins = () => api.get('/superadmin/admins')
export const createAdmin = (data) => api.post('/superadmin/admins', data)
export const getAdmin = (id) => api.get(`/superadmin/admins/${id}`)
export const deleteAdmin = (id) => api.delete(`/superadmin/admins/${id}`)
export const getAdminQuizzes = (id) => api.get(`/superadmin/admins/${id}/quizzes`)
export const toggleBanAdmin = (id) => api.patch(`/superadmin/admins/${id}/ban`)
export const deleteAdminQuiz = (id) => api.delete(`/superadmin/admins/quizzes/${id}`)

// Public quiz (no auth required)
export const getPublicQuizzes = () => api.get('/public/quizzes')
export const getPublicQuiz = (id) => api.get(`/public/quizzes/${id}`)
export const submitPublicQuiz = (id, answers) => api.post(`/public/quizzes/${id}/submit`, { answers })

export default api
