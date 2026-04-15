# Mindfactor Next.js Modernization Plan

## Summary

Modernize the current Mindfactor site from a static HTML/CSS/JavaScript project with client-side Supabase scripts into a structured **Next.js App Router** website that preserves the existing warm, mindful identity while improving typography, spacing, hierarchy, motion, responsiveness, image handling, SEO, and long-term maintainability.

This is an identity-preserving platform upgrade, not a brand reset.

Target outcomes:

- keep the warm editorial tone and cozy/minimal visual language
- improve readability, polish, responsiveness, and navigation flow
- replace duplicated static pages with reusable layouts and components
- move blog content into a single structured source of truth
- rebuild Supabase features as proper app features instead of global browser scripts
- create a codebase that is easier to maintain and grow

## Current State

The current repo is a static-site structure:

- root-level `.html` pages for the home page, about page, blog page, search page, journal page, and individual posts
- shared styling in `assets/styles/global.css`
- shared JavaScript in `assets/scripts/*.js`
- Supabase used directly in the browser for auth, comments, reactions, bookmarks, reflections, streaks, and journal entries

Current pain points:

- shared layout is duplicated across many HTML files
- blog post metadata is repeated manually in multiple places
- search is based on a hardcoded JavaScript array
- post pages are individual HTML files instead of structured content
- auth and feature logic are coordinated through `window.*` globals and DOM injection
- responsive and visual polish are acceptable but not systematic
- frontend-side admin seeding and auth assumptions should not survive the rewrite

## Recommended Stack

- **Next.js App Router**
- **TypeScript**
- **MDX** for blog content
- **Supabase** for auth, database, and storage
- **Server Components by default**
- **Client Components only for interactive features**
- **Vercel or another full Next.js-compatible host**

Recommended rendering posture:

- static generation or cached server rendering for content pages
- authenticated and interactive features backed by Server Actions or Route Handlers

## Architecture Target

### Route Structure

```txt
/
/about
/blog
/blog/[slug]
/search
/journal
/login        (optional if auth should not remain modal-only)
/profile      (optional in later phases)
```

### Application Structure

```txt
app/
  layout.tsx
  page.tsx
  about/page.tsx
  blog/page.tsx
  blog/[slug]/page.tsx
  search/page.tsx
  journal/page.tsx
  not-found.tsx

components/
  layout/
  ui/
  blog/
  auth/
  comments/
  reactions/
  journal/

content/
  posts/

lib/
  content/
  supabase/
  seo/
  utils/

public/
  images/
  icons/
```

## Product and Design Direction

### Preserve

- warm and minimal editorial atmosphere
- personal, reflective writing tone
- dark mode support
- a calm reading-focused experience

### Improve

- typography scale and contrast
- spacing rhythm and section composition
- content hierarchy on home, blog, and article pages
- motion and page transitions
- image treatment and visual richness
- mobile and tablet responsiveness
- search and discovery
- maintainability of blog and feature code

### Design Guardrails

Do:

- make the site feel more premium and more intentional
- favor editorial composition over app-dashboard styling
- use subtle motion and stronger hierarchy
- optimize for reading comfort

Do not:

- replace the identity with generic startup UI
- over-animate the experience
- overload the site with unnecessary client-side code
- turn the blog into a dashboard unless that becomes a deliberate product decision later

## Content Model

Move all blog posts into MDX with frontmatter.

### Post Schema

```ts
type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  featured: boolean
  coverImage?: string
  seoDescription: string
}
```

### Benefits

- one source of truth for post metadata
- dynamic blog index and post routes
- automatic search data generation
- easier related-post and featured-post systems
- cleaner authoring flow

### URL Strategy

Replace static `.html` post URLs with clean paths:

- `warmth-in-minimalism.html` -> `/blog/warmth-in-minimalism`

Add permanent redirects from legacy `.html` pages to the new routes.

## Supabase Modernization

Keep Supabase, but change how it is integrated.

### Rebuild Areas

- auth
- profiles
- comments
- reactions
- bookmarks
- reflections
- journal entries
- image uploads for journal entries

### Rules

- use SSR-compatible Supabase patterns for Next.js
- keep session state consistent on both server and client
- centralize Supabase utilities in `lib/supabase`
- do not expose insecure bootstrap logic in the frontend
- keep protected actions explicitly auth-gated

### Data Contracts

```ts
type Profile = {
  id: string
  username: string
  role: 'admin' | 'reader'
  accentColor?: string
}

type Comment = {
  id: string
  postSlug: string
  userId: string | null
  authorName: string
  content: string
  parentId: string | null
  createdAt: string
}

type Reaction = {
  postSlug: string
  userId: string
  emoji: string
}

type Bookmark = {
  id: string
  userId: string
  postSlug: string
  postTitle: string
  createdAt: string
}

type Reflection = {
  userId: string
  postSlug: string
  content: string
  updatedAt: string
}

type JournalEntry = {
  id: string
  userId: string
  eventName: string
  content: string
  imageUrls: string[]
  createdAt: string
}
```

## Feature Modernization Plan

### Content Pages

- rebuild home page with stronger section hierarchy and richer featured content
- generate blog listing from MDX
- generate article pages from MDX slugs
- rebuild about page as a reusable editorial page
- rebuild search so it uses generated content data instead of hardcoded arrays

### Auth

- implement sign in, sign up, sign out, and session persistence
- support a profile/preferences flow
- decide whether auth remains modal-first or moves to dedicated routes
- remove frontend admin seeding and hardcoded account assumptions

### Post Features

- rebuild reactions as a proper interactive component
- rebuild comments with replies and delete rules
- rebuild bookmarks for signed-in users
- rebuild private reflections per user/post
- preserve streaks and badges only if they still add value after the main migration

### Journal

- keep the journal as a private authenticated area
- rebuild entry creation, listing, deletion, and image uploads
- optionally add editing, drafts, filters, or search later

## Phased Execution Plan

## Phase 0: Preparation

Goal:

- lock architecture and migration boundaries before implementation

Tasks:

- confirm App Router
- confirm MDX content workflow
- confirm Supabase remains backend
- decide styling system
- define redirects and content schema
- inventory existing posts, metadata, and assets

Deliverables:

- finalized migration plan
- route map
- content schema
- redirect strategy

## Phase 1: Next.js Foundation

Goal:

- create the new app shell and shared infrastructure

Tasks:

- initialize Next.js with TypeScript
- set up App Router
- add root layout, header, footer, and theme system
- move global styles into a reusable design-token approach
- add metadata defaults, not-found page, and error UI
- establish responsive layout primitives

Deliverables:

- working Next.js shell
- reusable global layout
- dark mode and responsive foundations

Success criteria:

- no duplicated page chrome
- site boots as a clean Next.js app
- layout works across mobile and desktop

## Phase 2: Content Migration

Goal:

- move static content into a maintainable content pipeline

Tasks:

- convert posts into MDX
- define and validate frontmatter
- build blog list and blog detail routes
- migrate home and about content into reusable sections
- create redirects from old `.html` routes

Deliverables:

- MDX-powered content system
- dynamic blog routes
- generated blog listing

Success criteria:

- adding a new post requires only one content file
- post metadata exists in one place
- old links keep working through redirects

## Phase 3: Visual Refresh

Goal:

- improve the presentation without changing the identity

Tasks:

- refine font pairing and typography scale
- standardize spacing rhythm
- improve hero composition and section hierarchy
- improve article headers and metadata blocks
- upgrade cards and post lists
- improve responsive layouts and mobile nav
- upgrade image treatment using `next/image`
- add richer but restrained transitions and motion

Deliverables:

- refined editorial design system
- upgraded homepage/blog/post presentation
- better mobile and tablet layouts

Success criteria:

- the site feels more polished and intentional
- readability improves
- the visual identity still feels recognizably Mindfactor

## Phase 4: Supabase and Auth Rebuild

Goal:

- replace client-global auth/data patterns with app-native architecture

Tasks:

- configure Supabase SSR helpers
- implement session-aware auth flows
- create shared profile loading logic
- add auth-aware UI states
- remove insecure bootstrap behavior

Deliverables:

- proper auth architecture
- stable session handling
- reusable auth components

Success criteria:

- auth survives refresh and navigation correctly
- protected pages and actions behave consistently
- no `window.*` feature coordination is required

## Phase 5: Feature Migration

Goal:

- bring back dynamic member features with cleaner architecture

Tasks:

- rebuild comments
- rebuild reactions
- rebuild bookmarks
- rebuild reflections
- rebuild journal and storage uploads
- preserve streaks and badges only if still worthwhile

Deliverables:

- feature parity or better for core interactive features
- cleaner UX and error/loading states

Success criteria:

- the migrated features feel integrated rather than bolted on
- mobile and desktop UX are stable

## Phase 6: Search, Discovery, and SEO

Goal:

- improve content findability and distribution

Tasks:

- generate search index from real content
- implement category/tag filtering
- add related posts
- add metadata, canonical URLs, sitemap, and RSS
- add social share metadata

Deliverables:

- real content-backed search
- stronger discovery flow
- production SEO foundation

Success criteria:

- users can find posts without manual curation
- social sharing and search indexing are properly configured

## Phase 7: Hardening and Launch

Goal:

- prepare the site for production rollout

Tasks:

- test redirects
- test auth and feature flows
- test responsive behavior
- test comments/reactions/journal behaviors
- run accessibility and performance checks
- verify environment variables and deployment config

Deliverables:

- production-ready deployment
- launch checklist

Success criteria:

- the site is stable, polished, and ready to replace the static version

## Test Plan

### Routing

- all primary routes render
- legacy `.html` links redirect correctly
- missing routes render a branded 404

### Content

- blog index is generated from MDX
- post pages render metadata, content, and related content correctly
- new posts appear automatically in listing and search

### Auth and Data

- sign up, sign in, sign out, and session persistence work correctly
- protected actions reject unauthenticated access
- profile data loads and updates correctly

### Features

- comments can be created, replied to, and deleted according to role/ownership rules
- reactions toggle and counts refresh correctly
- bookmarks persist per user
- reflections save and load per user/post
- journal entries create, list, upload images, and delete correctly

### Design and UX

- theme toggle persists
- typography remains readable on long-form pages
- transitions feel smooth but not distracting
- layouts hold up on mobile, tablet, and desktop

### Performance and SEO

- images are optimized and responsive
- metadata is correct per page
- sitemap and RSS are generated
- content pages maintain strong Lighthouse performance

## Assumptions

- the project remains a personal editorial site first, not a SaaS dashboard
- the existing visual identity should be refined, not replaced
- blog content will be managed in MDX rather than a CMS for the first migration
- Supabase remains the backend
- the final deployment target supports full Next.js capabilities
- legacy URLs should continue to work via redirects
- search will begin as content-index search, not a hosted external search service

## Recommended Priority Order If Time Is Tight

1. Next.js foundation
2. content migration
3. visual refresh
4. auth rebuild
5. comments, reactions, bookmarks, reflections
6. journal
7. search, SEO, and launch polish

## Final Note

The point of this migration is not only to "use Next.js."

The point is to make Mindfactor:

- easier to maintain
- richer and more modern to use
- cleaner to extend
- still emotionally and visually consistent with what it already is

That should stay true throughout the implementation.
