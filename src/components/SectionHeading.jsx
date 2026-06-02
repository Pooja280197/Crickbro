const SectionHeading = ({ eyebrow, title, accent, text }) => {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>
        {title} {accent && <span className="gradient-text">{accent}</span>}
      </h2>
      {text && <p>{text}</p>}
    </div>
  );
};

export default SectionHeading;
