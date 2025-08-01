import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import SuiFlowLogin from './components/SuiFlowLogin.jsx';
import SuiFlowRegister from './components/Registration.jsx';
import SuiFlowDashboard from './components/SuiFlowDashboard.jsx';
import SuiFlowCheckout from './components/SuiFlowCheckout.jsx';
import WidgetPay from './components/WidgetPay.jsx';
import FlowXDemo from './pages/FlowXDemo.jsx';
import SuiFlowSuccess from './components/SuiFlowSuccess.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SuiFlowLogin />} />
          <Route path="/signup" element={<SuiFlowRegister />} />
          <Route path="/register" element={<SuiFlowRegister />} />
          <Route path="/dashboard" element={<SuiFlowDashboard />} />
          <Route path="/checkout/:productId" element={<SuiFlowCheckout />} />
          <Route path="/widget" element={<WidgetPay />} />
          <Route path="/flowx" element={<FlowXDemo />} />
          <Route path="*" element={<LandingPage />} />
          <Route path="/success" element={<SuiFlowSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;