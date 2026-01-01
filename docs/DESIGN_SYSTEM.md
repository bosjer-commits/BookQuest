# BookQuest Design System

This document outlines the design system for the BookQuest app, based on the fantasy/vintage book theme from the mockups.

## Color Palette

### Parchment/Background
- `--parchment`: `#F5E6D3` - Main background color
- `--parchment-dark`: `#E8D5BE` - Darker parchment for subtle variations
- `--parchment-light`: `#FDF9F3` - Light parchment for cards
- `--cream`: `#FFF8DC` - Cream for highlights

**Tailwind classes**: `bg-parchment`, `bg-parchment-dark`, `bg-parchment-light`, `bg-cream`

### Navy Blue (Header, UI Elements)
- `--navy`: `#1e3a5f` - Primary navy
- `--navy-dark`: `#152844` - Dark navy for depth
- `--navy-light`: `#2d4d6f` - Light navy for highlights

**Tailwind classes**: `bg-navy`, `text-navy`, `border-navy`

### Gold/Brass (Frames, Borders, Accents)
- `--gold`: `#d4a574` - Primary gold
- `--gold-light`: `#e8c89a` - Light gold for highlights
- `--gold-dark`: `#c9a05c` - Dark gold for shadows
- `--gold-metallic`: `#d4af37` - Metallic gold for special accents

**Tailwind classes**: `bg-gold`, `text-gold`, `border-gold`

### Brown (Borders, Text)
- `--brown`: `#8B4513` - Primary brown
- `--brown-dark`: `#6b3410` - Dark brown
- `--brown-text`: `#3a2a1f` - Brown for text

**Tailwind classes**: `text-brown`, `border-brown`

### Progress Bar
- `--progress-blue`: `#3a5a7a` - Progress bar fill
- `--progress-blue-dark`: `#2d4760` - Darker blue for gradient

### Accent Colors
- `--red-heart`: `#c41e3a` - Red for favorites/hearts
- `--orange-accent`: `#d97745` - Orange accent

**Tailwind classes**: `text-red-heart`, `bg-red-heart`

## Typography

### Font Families
- **Fantasy/Display**: `Cinzel` - Used for headers, titles, and the "Book Quest" banner
- **Serif/Body**: `Lora` - Used for body text, descriptions, and labels
- **Sans-serif**: System fonts - Used sparingly for UI elements

### Font Usage
```css
/* Headers and titles */
font-family: var(--font-fantasy);

/* Body text */
font-family: var(--font-serif);

/* UI elements */
font-family: var(--font-sans);
```

### Typography Scale
- **Display**: Use `.fantasy-header` class for large decorative headers
- **Headings**: `text-xl`, `text-2xl` with `font-fantasy`
- **Body**: `text-base`, `text-lg` with `font-serif`
- **Labels**: `text-sm`, `text-xs`

## Spacing

Consistent spacing scale based on mockup analysis:
- `--spacing-xs`: `4px` - Minimal spacing
- `--spacing-sm`: `8px` - Small spacing
- `--spacing-md`: `16px` - Medium spacing (default)
- `--spacing-lg`: `24px` - Large spacing
- `--spacing-xl`: `32px` - Extra large spacing

**Tailwind usage**: Use standard Tailwind spacing (`p-4`, `m-8`, etc.)

## Border Radius

- `--radius-sm`: `4px` - Small radius
- `--radius-md`: `8px` - Medium radius (buttons, cards)
- `--radius-lg`: `12px` - Large radius (parchment cards)
- `--radius-full`: `9999px` - Full radius (circles, pills)

## Shadows

- `--shadow-sm`: `0 2px 4px rgba(0,0,0,0.1)` - Subtle shadow
- `--shadow-md`: `0 4px 6px rgba(0,0,0,0.15)` - Medium shadow
- `--shadow-lg`: `0 6px 12px rgba(0,0,0,0.2)` - Large shadow
- `--shadow-gold`: `0 2px 8px rgba(212,175,55,0.3)` - Gold glow effect

## Component Classes

### `.fantasy-header`
Decorative header text with the fantasy font and subtle shadow.
```html
<h1 class="fantasy-header">Book Quest</h1>
```

### `.ornate-frame`
Gold-bordered frame with brown inset border, used for important content areas.
```html
<div class="ornate-frame">Content here</div>
```

### `.parchment-card`
Parchment-textured card with subtle aging effect.
```html
<div class="parchment-card p-4">Card content</div>
```

### `.fantasy-button`
Gold gradient button with brown border and hover effects.
```html
<button class="fantasy-button">Click Me</button>
```

### `.progress-bar-container` & `.progress-bar-fill`
Progress bar with gold background and blue fill.
```html
<div class="progress-bar-container">
  <div class="progress-bar-fill" style="width: 60%"></div>
</div>
```

### `.book-card`
Book cover card with hover lift effect and optional overlay.
```html
<div class="book-card">
  <img src="book-cover.jpg" alt="Book" />
  <div class="book-card-overlay">
    <!-- Overlay content (e.g., + button) -->
  </div>
</div>
```

### `.avatar-gold`
Avatar with gold border and navy inset.
```html
<img class="avatar-gold" src="avatar.jpg" alt="User" />
```

### `.ornate-banner`
Navy banner with ribbon-style edges (for header).
```html
<div class="ornate-banner">
  <h1 class="fantasy-header">Book Quest</h1>
</div>
```

### `.star-rating` & `.star`
Star rating component.
```html
<div class="star-rating">
  <svg class="star filled">...</svg>
  <svg class="star filled">...</svg>
  <svg class="star">...</svg>
</div>
```

### `.nav-icon`
Navigation icon with gold color and active state.
```html
<svg class="nav-icon active">...</svg>
```

## Layout Guidelines

### Mobile App Layout
- Max width: `100vw`
- Padding: `16px` (sides), `24px` (top/bottom)
- Phone mockup width: `375px` (standard mobile)

### Content Areas
- Main content should be contained within the parchment background
- Use consistent spacing between sections
- Book covers should maintain aspect ratio (approximately 2:3)

### Navigation
- Bottom navigation bar: `64px` height
- 4 icons: Book, Heart, Friends, Home
- Active state with glow effect

## Responsive Considerations

While the mockups show a mobile-first design, ensure:
- Touch targets are at least 44x44px
- Text is readable (minimum 14px for body text)
- Images are optimized for various screen densities

## Usage Examples

### Book Grid
```html
<div class="grid grid-cols-3 gap-4">
  <div class="book-card">
    <img src="book1.jpg" alt="Book 1" />
  </div>
  <!-- More books... -->
</div>
```

### Friend List Item
```html
<div class="flex items-center gap-4 p-4">
  <img class="avatar-gold w-12 h-12" src="avatar.jpg" alt="Friend" />
  <img class="w-12 h-16" src="book-cover.jpg" alt="Current Book" />
  <div class="flex-1">
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: 75%"></div>
    </div>
  </div>
</div>
```

### Header
```html
<header class="ornate-banner p-4 text-center">
  <h1 class="fantasy-header text-gold text-2xl">Book Quest</h1>
</header>
```

## Next Steps

When implementing components, refer to the mockup images in `/mockups/` for exact spacing, sizing, and visual reference.
