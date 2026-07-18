# Unified Admin Sidebar Design

## Goal

Replace the admin interface's two-column navigation with one compact sidebar. Each module's subpages will appear beneath its primary item so administrators can understand the hierarchy and move between related screens without losing content width.

## Scope

The shared navigation change applies to every admin module that currently opens the secondary pane:

- University
- Bootcamps
- Internship
- Marketplace
- Studio
- Webinars
- Contracts

Overview, Contacts, Admin Access, Audit Logs, and Profile Settings remain single links. Mobile bottom navigation remains unchanged.

## Interaction Design

The desktop sidebar retains its current expanded and collapsed widths, branding, dark surface, permissions, and module order.

When the sidebar is expanded:

- The active module is visually selected.
- Its child links render immediately below the parent with indentation and a quieter visual treatment.
- Only the active module's child links are expanded.
- Clicking another module navigates to that module's default route; the route change makes the new module active and expands its children.
- The active child receives the strongest nested-item highlight.

When the sidebar is collapsed:

- Only primary module icons are displayed.
- Child links are hidden rather than squeezed into the narrow rail.
- Existing title tooltips continue to identify module icons.
- Expanding the sidebar restores the child links for the current route.

## Architecture

The existing `Sidebar` component remains the single source of navigation truth. The module-specific arrays already used by the secondary pane will be retained and associated with their corresponding primary module.

Rendering changes are limited to the desktop admin branch:

1. Remove the secondary-pane width calculation and markup.
2. Render the active module's child array directly after its primary link.
3. Reuse the existing active-route helpers, custom match functions, permissions filtering, and local-storage collapse state.
4. Preserve the content layout and mobile navigation APIs so admin pages require no page-level modifications.

## Visual Treatment

The nested navigation will inherit the current utilitarian admin aesthetic:

- Parent rows keep the established icon, label, chevron, hover, and selected states.
- Child rows use a slim left guide, smaller type, and indentation aligned beneath the parent label.
- The active child uses a restrained light surface or accent treatment with accessible contrast.
- The sidebar remains `w-60` when expanded and `w-20` when collapsed, giving the recovered secondary-pane width back to page content.

## Route and Permission Behavior

- Existing module detection continues to decide the active parent.
- Existing child match functions continue to handle query-driven routes such as University and Bootcamp users, pricing, and payments.
- Child links are displayed only when their parent module passes the existing permission filter.
- Child matching prefers the most specific route. For Contracts, `/admin/contracts/new` selects New Contract, `/admin/contracts/templates` selects Templates, and the register plus `/admin/contracts/[id]` detail routes select Contracts.
- No database, authentication, middleware, or API changes are required.

## Verification

Automated coverage will verify the shared navigation structure and route behavior where the existing test setup allows. The primary correctness gate remains `bun run build`.

Browser verification will cover:

- Every affected module shows its children in the main sidebar.
- No secondary navigation pane appears on any affected page.
- Active parent and child states follow route changes.
- Collapsing and expanding the sidebar hides and restores children.
- Content receives the recovered horizontal space.
- Permission-filtered modules remain hidden.
- Mobile navigation remains unchanged.

## Out of Scope

- Reordering or renaming modules or subpages
- Adding new routes
- Redesigning mobile navigation
- Changing admin permissions
- Refactoring unrelated page content
