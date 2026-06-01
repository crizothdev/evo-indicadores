import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto py-7" style={{ paddingLeft: '24px', paddingRight: '10px', background: '#EBEDEF' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
