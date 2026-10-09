import './About.css';

const PRINCIPLES = [
  {
    index: '01',
    title: 'Portfolios that show the process',
    body: 'Every piece of work is presented with the tools, models, and workflow behind it — so the craft is as visible as the result.',
  },
  {
    index: '02',
    title: 'Briefs that leave nothing implied',
    body: 'Content type, style, format, aspect ratio, and commercial-use terms are defined up front, before a single frame is generated.',
  },
  {
    index: '03',
    title: 'Discovery built around craft',
    body: 'Brands find creators by skill, specialization, tooling, and content type — not by guesswork or follower counts.',
  },
];

export default function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__intro">
          <p className="eyebrow">About Crevo</p>
          <h2 id="about-title" className="about__title">
            A home for the people making AI&#8209;native creative work — and the brands looking for
            them.
          </h2>
          <div className="about__body">
            <p>
              Generative tools have given rise to a new kind of creative professional: AI
              filmmakers, animators, and generative artists. Crevo is the marketplace built around
              how they actually work.
            </p>
            <p>
              Brands and agencies come to Crevo to discover the right creators, publish clear
              creative briefs, evaluate portfolios with confidence, and carry an engagement from
              first look through final delivery.
            </p>
          </div>
        </div>

        <div id="principles" className="principles">
          <h3 className="visually-hidden">Principles</h3>
          <ol className="principles__list">
            {PRINCIPLES.map((item) => (
              <li key={item.index} className="principle">
                <span className="principle__index" aria-hidden="true">
                  {item.index}
                </span>
                <h4 className="principle__title">{item.title}</h4>
                <p className="principle__body">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
