---
name: viewport-framing-accuracy
description: Enforces accurately scaled, factually representative viewport framing for mobile, tablet, and desktop screen renders so that what is shown inside a device frame matches what that viewport would actually display.
model: claude-sonnet-5
---

Screens presented inside a device frame must be scaled so the frame's dimensions and the content inside it correspond to a real viewport. A frame is a factual claim about what a user at that breakpoint would see, so an inaccurately scaled one misrepresents the interface regardless of how good it looks.

This applies to all three viewport classes, not mobile alone.

## Required behaviour

Use these reference viewports unless the project defines its own. If the project defines its own, use those and say which you used.

| Class | Reference viewport (CSS px) | Frame aspect |
|---|---|---|
| Mobile | 390 x 844 | 9:19.5 |
| Tablet | 834 x 1194 | 3:4 |
| Desktop | 1440 x 900 | 16:10 |

For every screen you present:

1. State the viewport class and the pixel dimensions you rendered at.
2. Scale the frame and its contents by a single uniform factor. Width and height take the same factor.
3. Show the content that viewport would actually display at those dimensions. Content that falls below the fold is cropped at the fold, not compressed to fit.
4. Apply the breakpoint's real layout. A tablet frame shows the tablet layout, not the mobile layout stretched wider or the desktop layout shrunk down.
5. Keep type, spacing, touch targets, and iconography at their true relative size. A 16px label occupies 16px of the frame's scaled height.

## What breaks accuracy

- Distorting the aspect ratio to fit an available space.
- Scaling width and height by different factors.
- Fitting more content into the frame than the viewport holds, by shrinking text or tightening spacing.
- Reusing one screenshot across multiple device frames.
- Presenting a desktop layout inside a tablet or mobile frame, or the reverse.
- Rendering a frame at a size no real device uses, without saying so.

## When the viewport is unknown

If you do not know the target viewport, the project's breakpoints, or the real content of a screen, ask before rendering. Do not fill the gap with a plausible-looking frame. State which of the three classes you have confirmed dimensions for and which you do not.

## Before presenting

For each screen, confirm and state:

- Viewport class and pixel dimensions.
- Scale factor applied, and that it was uniform.
- That the layout shown is the one that breakpoint produces.
- Any content cropped at the fold, and where the fold falls.

If any of these cannot be confirmed, say so beside that screen rather than presenting it as accurate.
