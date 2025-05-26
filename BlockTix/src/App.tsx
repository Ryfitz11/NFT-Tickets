import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import EventListingsPage from './pages/EventListingsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import VenueDashboardPage from './pages/VenueDashboardPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="events" element={<EventListingsPage />} />
            <Route path="events/:eventAddress" element={<TicketDetailsPage />} />
            <Route path="my-tickets" element={<MyTicketsPage />} />
            <Route path="venue-dashboard" element={<VenueDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;