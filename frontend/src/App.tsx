import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import SurveyForm from '@/components/Survey/SurveyForm';
import Results from '@/components/Results/Results';
import Nav from '@/components/Nav';
import { BookmarkIcon, ClipboardIcon, SparkIcon } from '@/components/icons';

import styles from './App.module.css';

function AppHeader() {
  const location = useLocation();
  const isResults = location.pathname.startsWith('/results');

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <div className={styles.pageIcon} aria-hidden="true">
          {isResults ? (
            <SparkIcon className={styles.pageIconSvg} />
          ) : (
            <ClipboardIcon className={styles.pageIconSvg} />
          )}
        </div>
        <div>
          <h1 className={styles.title}>{isResults ? 'Results' : 'Survey'}</h1>
          <p className={styles.subtitle}>
            {isResults
              ? 'Overview of the collected survey data'
              : 'Please fill out the form below'}
          </p>
        </div>
      </div>

      {!isResults && (
        <div className={styles.headerMeta}>
          <div className={styles.stepBlock}>
            <span className={styles.stepText}>Step 1 of 3</span>
            <div className={styles.progress} aria-hidden="true">
              <span className={styles.progressFill} />
              <span className={styles.progressTrack} />
              <span className={styles.progressTrack} />
            </div>
          </div>

          <button type="button" className={styles.saveButton}>
            <BookmarkIcon className={styles.saveIcon} />
            <span>Save &amp; Exit</span>
          </button>
        </div>
      )}
    </header>
  );
}

const App: React.FC = () => (
  <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Nav />
    </aside>

    <div className={styles.contentArea}>
      <AppHeader />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<SurveyForm />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default App;
