export const prerender = true;

// adapter-static emits flat `<route>.html` files by default
// (trailingSlash='never'); setting trailingSlash='always' instructs the router
// AND adapter-static to use the directory output shape `<route>/index.html`,
// matching the canonical GitHub Pages convention (URLs end with /).
export const trailingSlash = 'always';
