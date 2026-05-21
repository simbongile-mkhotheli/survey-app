import React from 'react';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';

import { ChartIcon, ClipboardIcon, SparkIcon } from '@/components/icons';
import Nav, { ROUTES } from '@/components/Nav';
import Results from '@/components/Results/Results';
import SurveyForm from '@/components/Survey/SurveyForm';

import styles from './App.module.css';

function AppHeader(): React.ReactNode {
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

      <div className={styles.headerMeta}>
        <div className={styles.progressBlock} aria-label="Survey progress">
          <div className={styles.progressLabelRow}>
            <span className={styles.progressLabel}>Step 1 of 3</span>
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <span className={styles.progressFill} />
          </div>
        </div>
      </div>
    </header>
  );
}

function DesktopRail(): React.ReactNode {
  const location = useLocation();
  const isResults = location.pathname.startsWith('/results');

  const actions = isResults
    ? [
        {
          to: ROUTES.HOME,
          icon: ClipboardIcon,
          title: 'Back to Survey',
          subtitle: 'Continue where you left off',
        },
        {
          to: ROUTES.RESULTS,
          icon: ChartIcon,
          title: 'Review Results',
          subtitle: 'Stay on the summary view',
        },
      ]
    : [
        {
          to: ROUTES.RESULTS,
          icon: ChartIcon,
          title: 'View Results',
          subtitle: 'Check the survey insights',
        },
        {
          to: ROUTES.HOME,
          icon: ClipboardIcon,
          title: 'Stay on Survey',
          subtitle: 'Keep filling in the form',
        },
      ];

  return (
    <aside className={styles.desktopRail} aria-label="Quick navigation">
      <section className={styles.railHero}>
        <div className={styles.railHeroBadge} aria-hidden="true">
          <SparkIcon className={styles.railHeroIcon} />
        </div>
        <h2 className={styles.railHeroTitle}>
          {isResults ? 'Insights are ready.' : 'Let’s finish strong!'}
        </h2>
        <p className={styles.railHeroText}>
          {isResults
            ? 'Use the survey summary to review what has been captured.'
            : 'Your responses help shape better experiences.'}
        </p>
      </section>

      <section className={styles.railPanel}>
        <div className={styles.railPanelHeader}>
          <span className={styles.railPanelMarker} aria-hidden="true" />
          <h3 className={styles.railPanelTitle}>What&apos;s Next?</h3>
        </div>

        <div className={styles.railActions}>
          {actions.map(({ to, icon: Icon, title, subtitle }) => (
            <NavLink
              key={title}
              to={to}
              className={({ isActive }) =>
                `${styles.railAction} ${isActive ? styles.railActionActive : ''}`
              }
            >
              <span className={styles.railActionIcon} aria-hidden="true">
                <Icon className={styles.railActionIconSvg} />
              </span>

              <span className={styles.railActionCopy}>
                <span className={styles.railActionTitle}>{title}</span>
                <span className={styles.railActionSubtitle}>{subtitle}</span>
              </span>

              <span className={styles.railActionArrow} aria-hidden="true">
                →
              </span>
            </NavLink>
          ))}
        </div>
      </section>
    </aside>
  );
}

const App: React.FC = () => (
  <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Nav />
    </aside>

    <div className={styles.contentArea}>
      <AppHeader />

      <div className={styles.workspace}>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<SurveyForm />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>

        <DesktopRail />
      </div>
    </div>
  </div>
);

export default App;
