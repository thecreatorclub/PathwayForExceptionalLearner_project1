import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Page from './page';
import Page1 from './teachers/page';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/page1" element={<Page1 />} />
      </Routes>
    </Router>
  );
};

export default App;
