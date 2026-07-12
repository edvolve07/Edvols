import {
  Link as WouterLink,
  Route as WouterRoute,
  Switch,
  Redirect,
  useLocation as useWouterLocation,
  useSearchParams as useWouterSearchParams,
  useParams as useWouterParams,
  useRoute,
  Router,
} from 'wouter';

export { Switch, Router, useRoute, useParams as useWouterParams };

export const Navigate = Redirect;

export function Route({ path, component: Component, children }) {
  return (
    <WouterRoute path={path}>
      {Component ? <Component /> : children}
    </WouterRoute>
  );
}

export function Link({ href, onClick, ...props }) {
  return <WouterLink to={href} onClick={onClick} {...props} />;
}

export function usePathname() {
  const [location] = useWouterLocation();
  return location;
}

export function useNavigate() {
  const [, navigate] = useWouterLocation();
  return navigate;
}

export function useLocation() {
  const [location] = useWouterLocation();
  return { pathname: location };
}

export function useSearchParams() {
  const [params] = useWouterSearchParams();
  return params;
}

export function useParams() {
  return useWouterParams();
}

export function NavLink({ to, children, className, ...props }) {
  const [location] = useWouterLocation();
  const isActive = location === to;
  const resolvedClassName = typeof className === 'function'
    ? className({ isActive })
    : className;

  if (typeof children === 'function') {
    return (
      <WouterLink to={to} className={resolvedClassName} {...props}>
        {children({ isActive })}
      </WouterLink>
    );
  }

  return (
    <WouterLink to={to} className={resolvedClassName} {...props}>
      {children}
    </WouterLink>
  );
}
