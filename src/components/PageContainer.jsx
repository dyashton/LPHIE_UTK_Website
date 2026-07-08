export default function PageContainer({
  children,
  className = "",
  maxWidthClassName = "max-w-6xl",
  paddedTop = true,
}) {
  return (
    <div
      className={[
        "w-full",
        paddedTop ? "pt-20 sm:pt-24" : "",
        "px-4 sm:px-8",
        className,
      ].join(" ")}
    >
      <div className={[maxWidthClassName, "mx-auto", "w-full"].join(" ")}>
        {children}
      </div>
    </div>
  );
}

