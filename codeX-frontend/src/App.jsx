import './App.css'
import { Routes,Route } from 'react-router-dom'
import Header from './components/Header'
import ContentList from './components/ContestList'
import Info from './components/Info'
import Register from './components/Register'
import Login from './components/Login'
import ProblemPage from './components/ProblemPage'
import ContestPage from './components/ContestPage'

function App() { 
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path='/' element={<Info/>} />
          <Route path='/contest' element={<ContentList/>} />
          <Route path='/contest/:contestId' element={<ContestPage/>}>
            <Route path='/contest/:contestId/problem/:problemId' element={<ProblemPage/>} />
          </Route>
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </main>
    </>
  )
}

export default App
