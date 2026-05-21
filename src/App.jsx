import React from 'react';
import AppRoutes from './routes/AppRoutes';
import Alerts from './components/notifications/Alerts';

function App() {
  return (
    <>
      <AppRoutes />
      <Alerts />
    </>
  );
}

export default App;
