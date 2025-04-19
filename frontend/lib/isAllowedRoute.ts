const userAllowRoutes = ['/sign-in', '/sign-up', '/shared']
export const isAllowedRoute = () => userAllowRoutes.some(route =>
	window.location.pathname === '/' || window.location.pathname.startsWith(route)
)