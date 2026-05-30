export default function PageIntro({ title, description, action }) {
  return (
    <section className="page-intro">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}