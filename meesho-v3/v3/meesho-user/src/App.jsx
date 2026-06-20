import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routing/routes';
import { injectStore } from './api/AxiosInterceptor';
import { store } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';

injectStore(store);

const App = () => (
  <ErrorBoundary>
    <Suspense fallback={
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', fontFamily:'sans-serif', fontSize:'14px', color:'#6b7280' }}>
        Loading...
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  </ErrorBoundary>
);

export default App;
