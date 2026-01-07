
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout/Layout';
import SearchPage from './components/Search/SearchPage';
import ProfilePage from './components/Profile/ProfilePage';
import ReportsPage from './components/Reports/ReportsPage';

import HomePage from './components/Home/HomePage';

// Placeholder components until we build them
// const SearchPage = () => <div className="p-4">Search Component</div>;
// const ProfilePage = () => <div className="p-4">Profile Component</div>;
// const ReportsPage = () => <div className="p-4">Reports Component</div>;

function App() {
  return (
    <Router>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="employee/:id" element={<ProfilePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
