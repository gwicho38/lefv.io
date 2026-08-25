import { Column } from "@/components/layout/Layout";

export default function About() {
  return (
    <Column>
    <div>
      <header className="mb-10 max-w-measure">
        <h1 className="text-2xl font-bold tracking-tight">About</h1>
      </header>

      <div className="max-w-measure space-y-5">
        <p>
          I am Luis E. Fernández de la Vara — an attorney admitted in New York
          and Florida, and a software engineer. Most of my work sits where those
          two things overlap.
        </p>
        <p>
          On the legal side I practice corporate and cross-border work as
          Counsel at Holon Law Partners and Of Counsel at JZ Law, after
          associate years at Linklaters, Greenberg Traurig, and Perlman Bajandas
          Yevoli &amp; Albright. On the engineering side I led a solution
          engineering team at C3 AI building AI applications for federal defense
          customers, and before that worked on vehicle-to-cloud connectivity at
          General Motors. I currently build speech recognition and diarization
          systems at Lysk in Paris.
        </p>
        <p>
          I am also the founder and lead engineer of Praxis, a legal AI platform
          running in production at two firms, and a founding member of EVerlong
          Technologies. I hold a J.D. from NYU School of Law and am finishing an
          M.S. in Computer Science at the University of Illinois.
        </p>
        <p className="text-muted-foreground">
          Reach me at{" "}
          <a className="underline underline-offset-4" href="mailto:luis@lefv.io">
            luis@lefv.io
          </a>
          , or on{" "}
          <a className="underline underline-offset-4" href="https://github.com/gwicho38">
            GitHub
          </a>{" "}
          and{" "}
          <a className="underline underline-offset-4" href="https://linkedin.com/in/lefv">
            LinkedIn
          </a>
          .
        </p>
      </div>

      <section className="mt-16">
        <h2 className="mb-4 font-mono text-xs text-muted-foreground">
          Something to play with
        </h2>
        {/* Pico-8 renders a square display, so a 4:3 box cropped the cartridge. */}
        <div className="aspect-square w-full max-w-[460px] overflow-hidden rounded border">
          <iframe
            src="https://www.lexaloffle.com/bbs/widget.php?pid=picochill"
            title="Pico-8 cartridge"
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </section>
    </div>
    </Column>
  );
}
