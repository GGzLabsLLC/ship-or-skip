export default function Hero({
  eyebrow,
  title,
  copy,
  align = "center",
  variant = "",
  className = "",
  children = null,
}) {
  const classes = [
    "hero",
    variant ? `hero--${variant}` : "",
    align ? `hero--align-${align}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className="hero__inner">
        {eyebrow ? <p className="hero__eyebrow">{eyebrow}</p> : null}
        {title ? <h1 className="hero__title">{title}</h1> : null}
        {copy ? <p className="hero__copy">{copy}</p> : null}
        {children}
      </div>
    </section>
  );
}
