---
name: "Ship or Skip"
description: "Atmospheric dark UI with glassy panels and a blue-to-violet accent gradient."
updated: "2026-04-24"

tokens:
  color:
    bg: { $type: color, $value: "#0a0d14" }
    bg_gradient_start: { $type: color, $value: "#09101a" }
    panel: { $type: color, $value: "#121826" }
    panel_2: { $type: color, $value: "#171f31" }
    panel_floor: { $type: color, $value: "#0d1320" }

    text: { $type: color, $value: "#f3f7ff" }
    text_soft: { $type: color, $value: "#9dadc7" }
    text_strong: { $type: color, $value: "#f8fafc" }
    link: { $type: color, $value: "#c8d6ff" }
    button_secondary_text: { $type: color, $value: "#dbe5ff" }

    border: { $type: color, $value: "rgba(255, 255, 255, 0.08)" }
    border_subtle: { $type: color, $value: "rgba(255, 255, 255, 0.06)" }

    accent: { $type: color, $value: "#7c9cff" }
    accent_2: { $type: color, $value: "#9d7cff" }
    accent_indigo: { $type: color, $value: "#6366f1" }
    accent_purple: { $type: color, $value: "#7c3aed" }
    accent_periwinkle: { $type: color, $value: "#818cf8" }
    accent_magenta: { $type: color, $value: "#a855f7" }
    accent_cyan: { $type: color, $value: "#67e8f9" }

    accent_focus: { $type: color, $value: "rgba(124, 156, 255, 0.35)" }

    success: { $type: color, $value: "#7ef0b8" }
    success_bright: { $type: color, $value: "#b8ffd9" }

    warning_text: { $type: color, $value: "#ffd98a" }
    warning_bg: { $type: color, $value: "rgba(255, 196, 87, 0.1)" }
    warning_border: { $type: color, $value: "rgba(255, 196, 87, 0.22)" }

    error_text: { $type: color, $value: "#fecaca" }
    error_bg: { $type: color, $value: "rgba(127, 29, 29, 0.25)" }
    error_border: { $type: color, $value: "rgba(248, 113, 113, 0.3)" }

    glass_white_a02: { $type: color, $value: "rgba(255, 255, 255, 0.02)" }
    glass_white_a03: { $type: color, $value: "rgba(255, 255, 255, 0.03)" }
    glass_white_a04: { $type: color, $value: "rgba(255, 255, 255, 0.04)" }
    glass_white_a05: { $type: color, $value: "rgba(255, 255, 255, 0.05)" }
    glass_white_a06: { $type: color, $value: "rgba(255, 255, 255, 0.06)" }

    input_border: { $type: color, $value: "rgba(148, 163, 184, 0.16)" }
    input_placeholder: { $type: color, $value: "rgba(148, 163, 184, 0.7)" }
    input_focus: { $type: color, $value: "rgba(129, 140, 248, 0.7)" }

    header_scrim: { $type: color, $value: "rgba(10, 13, 20, 0.8)" }

  gradient:
    app_background_css:
      $type: string
      $value: "radial-gradient(circle at top, rgba(124, 156, 255, 0.16), transparent 28%), linear-gradient(180deg, #09101a 0%, #0a0d14 100%)"
    accent_css: { $type: string, $value: "linear-gradient(135deg, #7c9cff, #9d7cff)" }
    panel_css: { $type: string, $value: "linear-gradient(180deg, #121826, #171f31)" }

    submit_step_css: { $type: string, $value: "linear-gradient(135deg, #6366f1, #a855f7)" }
    upload_icon_css: { $type: string, $value: "linear-gradient(135deg, #7c3aed, #818cf8)" }

    battle_intro_css:
      $type: string
      $value: "radial-gradient(circle at top left, rgba(124, 156, 255, 0.14), transparent 38%), linear-gradient(180deg, rgba(18, 24, 38, 0.94), rgba(12, 17, 30, 0.98))"
    battle_arena_css:
      $type: string
      $value: "radial-gradient(circle at top center, rgba(124, 156, 255, 0.08), transparent 32%), linear-gradient(180deg, rgba(10, 14, 24, 0.94), rgba(7, 11, 19, 0.98))"
    submit_form_css:
      $type: string
      $value: "linear-gradient(180deg, rgba(17, 24, 39, 0.88), rgba(10, 14, 28, 0.94))"

  typography:
    font_family_sans:
      $type: fontFamily
      $value: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

    weight_semibold: { $type: fontWeight, $value: 600 }
    weight_bold: { $type: fontWeight, $value: 700 }
    weight_extrabold: { $type: fontWeight, $value: 800 }
    weight_black: { $type: fontWeight, $value: 900 }

    size_xs: { $type: fontSize, $value: "0.72rem" }
    size_sm: { $type: fontSize, $value: "0.78rem" }
    size_md: { $type: fontSize, $value: "0.98rem" }
    size_base: { $type: fontSize, $value: "1rem" }
    size_lg: { $type: fontSize, $value: "1.25rem" }
    size_xl: { $type: fontSize, $value: "1.4rem" }
    size_hero_css: { $type: string, $value: "clamp(2.2rem, 5vw, 4.25rem)" }

    lh_display: { $type: lineHeight, $value: 0.95 }
    lh_body: { $type: lineHeight, $value: 1.6 }

    track_display: { $type: letterSpacing, $value: "-0.05em" }
    track_heading: { $type: letterSpacing, $value: "-0.03em" }
    track_eyebrow: { $type: letterSpacing, $value: "0.14em" }

  space:
    xs: { $type: dimension, $value: "8px" }
    sm: { $type: dimension, $value: "12px" }
    md: { $type: dimension, $value: "16px" }
    lg: { $type: dimension, $value: "24px" }
    xl: { $type: dimension, $value: "32px" }
    page_y: { $type: dimension, $value: "40px" }

  radius:
    tile: { $type: dimension, $value: "10px" }
    sm: { $type: dimension, $value: "14px" }
    md: { $type: dimension, $value: "16px" }
    lg: { $type: dimension, $value: "22px" }
    xl: { $type: dimension, $value: "24px" }
    pill: { $type: dimension, $value: "999px" }

  shadow:
    panel:
      $type: shadow
      $value:
        - { offsetX: "0px", offsetY: "18px", blur: "50px", spread: "0px", color: "rgba(0, 0, 0, 0.3)", inset: false }

    hover_lift:
      $type: shadow
      $value:
        - { offsetX: "0px", offsetY: "24px", blur: "60px", spread: "0px", color: "rgba(0, 0, 0, 0.34)", inset: false }

    accent_glow:
      $type: shadow
      $value:
        - { offsetX: "0px", offsetY: "12px", blur: "28px", spread: "0px", color: "rgba(124, 156, 255, 0.24)", inset: false }

    focus_ring:
      $type: shadow
      $value:
        - { offsetX: "0px", offsetY: "0px", blur: "0px", spread: "2px", color: "rgba(10, 13, 20, 0.9)", inset: false }
        - { offsetX: "0px", offsetY: "0px", blur: "0px", spread: "4px", color: "rgba(124, 156, 255, 0.35)", inset: false }

    form_focus_glow:
      $type: shadow
      $value:
        - { offsetX: "0px", offsetY: "0px", blur: "0px", spread: "4px", color: "rgba(129, 140, 248, 0.12)", inset: false }

  effect:
    header_blur: { $type: dimension, $value: "16px" }

  motion:
    duration_fast: { $type: duration, $value: "150ms" }
    duration_standard: { $type: duration, $value: "180ms" }
    duration_slow: { $type: duration, $value: "200ms" }
    easing_standard: { $type: string, $value: "ease" }
    hover_raise_1: { $type: string, $value: "translateY(-1px)" }
    hover_raise_2: { $type: string, $value: "translateY(-2px)" }

  layout:
    container_max: { $type: dimension, $value: "1200px" }
    gutter_desktop: { $type: dimension, $value: "32px" }
    gutter_mobile: { $type: dimension, $value: "20px" }

    breakpoint_sm: { $type: dimension, $value: "720px" }
    breakpoint_md: { $type: dimension, $value: "980px" }
    breakpoint_lg: { $type: dimension, $value: "1080px" }
    breakpoint_xl: { $type: dimension, $value: "1100px" }

    header_height_desktop: { $type: dimension, $value: "72px" }
    header_height_mobile: { $type: dimension, $value: "64px" }

---

# Ship or Skip - Design

## Product vibe
Ship or Skip is a dark, atmospheric "builder arena" with soft glass panels, high-radius shapes, and a bright blue-to-violet gradient accent. It should feel fast, playful, and modern; more "late-night hack session" than corporate dashboard.

## Color & lighting
- Canvas is near-black navy with a subtle top glow; avoid flat #000.
- Surfaces are layered: faint dark gradients + low-alpha white "glass" fills.
- Borders are 1px translucent hairlines; hover states often lean toward the accent.
- Links use a soft periwinkle that reads clearly on dark.
- Status colors are expressive but not harsh (mint success, amber warning, soft red error).

## Typography
- Inter/system sans with bold, tight display headlines.
- Eyebrows/labels use uppercase + wide tracking (used for kickers and table headers).
- Body copy stays roomy (larger size, generous line-height) for dark-mode readability.

## Shape language
- Big rounded rectangles (22-24px) for panels and cards.
- Fully-rounded pills for nav, filters, chips, and compact metrics.

## Elevation & motion
- Depth comes from soft, large shadows; hover lifts are subtle (1-2px).
- Transitions are fast (150-200ms) and understated.

## Component intent
- Primary buttons are gradient-backed CTAs; secondary buttons are glassy with hairline borders.
- Cards are media-forward (cover-cropped screenshots) with muted metadata and clear primary action.
- Forms feel "premium": tall inputs, soft focus glow, and tinted error panels.

## Accessibility intent
- Keep focus rings visible on every interactive control.
- Use both color and text for state (e.g., Pending/Approved/Rejected).
