/**
 * Single client entry, loaded once per session by BaseLayout (works with <ClientRouter />:
 * every module hangs its work off `astro:page-load` / `astro:before-swap`).
 */
import './ui/theme';
import './ui/nav';
import './motion';
