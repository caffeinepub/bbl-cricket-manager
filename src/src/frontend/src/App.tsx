import { RouterProvider, createRouter, createRoute, createRootRoute, Link, Outlet, useRouterState, useParams } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useIsCallerAdmin } from './hooks/useQueries';
import { Home, Users, Trophy, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

// Pages
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import RegisterPage from './pages/RegisterPage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import AdminPage from './pages/AdminPage';

function Navigation() {
  const routerState = useRouterState();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { theme, setTheme } = useTheme();
  
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  
  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      await login();
    }
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/players', label: 'Players', icon: Users },
    { to: '/matches', label: 'Matches', icon: Trophy },
  ];
  
  // Show Admin link to all authenticated users
  // Authorization is handled on the AdminPage itself
  if (isAuthenticated) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }
  
  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-2xl text-primary tracking-wider">
              BBL CRICKET
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const isActive = routerState.location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-sm"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              className="rounded-sm"
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
            
            {isAuthenticated && (
              <Link to="/register">
                <Button variant="default" className="rounded-sm bg-accent hover:bg-accent/90">
                  Register as Player
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = routerState.location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026. Built with ❤️ using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  ),
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/players',
  component: PlayersPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const matchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matches',
  component: MatchesPage,
});

const matchDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/matches/$matchId',
  component: MatchDetailsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  playersRoute,
  registerRoute,
  matchesRoute,
  matchDetailsRoute,
  adminRoute,
]);

// Create router
const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
