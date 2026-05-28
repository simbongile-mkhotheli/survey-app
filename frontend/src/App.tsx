import { Route, Routes } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import ResultsPage from '@/pages/ResultsPage';
import SurveyPage from '@/pages/SurveyPage';
import { ROUTES } from '@/constants/routes';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<SurveyPage />} />
        <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
      </Route>
    </Routes>
  );
}
