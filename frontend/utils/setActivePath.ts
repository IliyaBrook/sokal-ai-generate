export const setActivePath = (pathname: string, activePath: string) =>
	pathname === activePath ? 'active-route menu-link' : 'menu-link'
