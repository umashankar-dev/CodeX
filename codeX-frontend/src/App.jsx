import './App.css'
import { Routes,Route } from 'react-router-dom'
import Header from './components/Header'
import ContentList from './components/ContestList'
import Info from './components/Info'
import Register from './components/Register'
import Login from './components/Login'
import ProblemPage from './components/ProblemPage'
import ContestPage from './components/ContestPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import CreateContest from './components/CreateContest'
import AddProblem from './components/AddProblem'

function App() { 
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path='/' element={
            <ProtectedRoute>
              <Info/>
            </ProtectedRoute>
            } />
          <Route path='/contests' element={
            <ProtectedRoute>
              <ContentList/>
            </ProtectedRoute>
            } />
          <Route path='/contests/:contestId' element={
            <ProtectedRoute>
              <ContestPage/>
            </ProtectedRoute>
            }/>
          <Route path='/contests/:contestId/problems/:problemId' element={
            <ProtectedRoute>
              <ProblemPage/>
            </ProtectedRoute>            
            } />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />

          <Route path='/create-contest' element={
            <AdminRoute>
              <CreateContest/>
            </AdminRoute>
          } />
          <Route path='/add-problem' element={
            <AdminRoute>
              <AddProblem/>
            </AdminRoute>
          } />
        </Routes>
      </main>
    </>
  )
}

export default App
