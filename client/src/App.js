import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { EvaluationProvider } from './context/EvaluationContext';
import { ReportProvider } from './context/ReportContext';

import AppRoutes from './routes';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CourseProvider>
          <EvaluationProvider>
            <ReportProvider>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
              <AppRoutes />
            </ReportProvider>
          </EvaluationProvider>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;