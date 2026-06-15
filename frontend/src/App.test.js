import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./pages/Login', () => () => <div>Login Page</div>);
jest.mock('./pages/Register', () => () => <div>Register Page</div>);
jest.mock('./pages/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/CreateCampaign', () => () => <div>Create Campaign Page</div>);
jest.mock('./pages/CampaignCreatives', () => () => <div>Campaign Creatives Page</div>);
jest.mock('./pages/PublisherDashboard', () => () => <div>Publisher Dashboard Page</div>);
jest.mock('./pages/WebsiteManagement', () => () => <div>Website Management Page</div>);
jest.mock('./pages/Analytics', () => () => <div>Analytics Page</div>);
jest.mock('./pages/PaymentHistory', () => () => <div>Payment History Page</div>);
jest.mock('./pages/PayoutRequest', () => () => <div>Payout Request Page</div>);
jest.mock('./pages/AdminDashboard', () => () => <div>Admin Dashboard Page</div>);

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios,
  };
});

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <>{children}</>,
  Routes: ({ children }) => {
    const routes = Array.isArray(children) ? children : [children];
    return routes[0]?.props?.element || null;
  },
  Route: ({ element }) => element,
  Navigate: () => null,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
}), { virtual: true });

test('renders AfriAds homepage', () => {
  render(<App />);
  expect(screen.getAllByText(/AfriAds/i).length).toBeGreaterThan(0);
});
