import React from 'react';
import { Routes, Route } from 'react-router-dom';

import SurveyForm from './components/Survey/SurveyForm';
import Results    from './components/Results/Results';
import Nav        from "./components/Nav";

import appStyles  from './App.module.css';
import surveyStyles from './components/Survey/SurveyForm.module.css';

const App: React.FC = () => (
  <div className={appStyles.container}>
    <header className={surveyStyles.header}>
      <h1 className={appStyles.heading}>_ Surveys</h1>
      <Nav />
    </header>

    <main>
      <Routes>
        <Route path="/"        element={<SurveyForm />} />
        <Route path="/results" element={<Results />}   />
      </Routes>
    </main>
  </div>
);

export default App;
