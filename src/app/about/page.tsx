export default function About() {
  return (
    <main className="about-page">
      <div className="about-left">
        <h1 className="about-heading">About Me</h1>

        <div className="about-body">
          <p>
            I&rsquo;ve spent the better part of <span className="about-gold">five years</span> building
            software - starting as a developer, growing into product management, and finding my stride
            somewhere in between. Most PMs hand off specs and wait. I prototype in code. That overlap
            between vision and execution is where I do my best work, and it&rsquo;s what makes me useful
            on both sides of the table.
          </p>
          <p>
            I studied computer science, but what I really learned was how to see. I&rsquo;m the person
            on the team who notices the transition that feels a frame too slow, the typography that&rsquo;s
            a half-step off, the layout that works but doesn&rsquo;t quite land. That{' '}
            <span className="about-gold">last ten percent</span> - the gap between something that functions
            and something that feels right - is where I live.
          </p>
          <p>
            I think we&rsquo;re in a moment where anyone can ship a product, but very few people can make
            one that someone actually wants to come back to. AI can build the thing. It can&rsquo;t tell
            you why the thing feels off. That sensitivity - knowing when to add and when to hold back -
            is what I bring to the work.
          </p>
          <p>
            When I&rsquo;m not building, I&rsquo;m probably eating something I spent too long finding on
            Google Maps, rewatching Ratatouille for the hundredth time, snowboarding, taking photos, or
            hanging out with friends who&rsquo;d reluctantly admit I&rsquo;m the best-dressed one there.
          </p>
          <p>
            <span className="about-gold">Good work comes from people who notice things</span> - good food,
            good films, good fits. That sensibility shows up in everything I make.
          </p>
        </div>
      </div>

      <div className="about-right">
        <div className="about-image-placeholder" />
      </div>
    </main>
  );
}
