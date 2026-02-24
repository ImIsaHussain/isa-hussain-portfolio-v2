export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'image'; src: string; alt?: string };

export type Project = {
  id: string;
  title: string;
  shortDesc: string;
  nda: boolean;
  image?: string;
  role?: string;
  heroImages?: string[];
  content?: ContentBlock[];
  longDesc?: string;
  links?: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    id: 'wbt',
    title: 'WBT',
    shortDesc: 'A web-based training platform built for scalable content delivery and learner engagement.',
    nda: false,
    image: undefined,
    role: 'Product Manager, Designer & Developer',
    heroImages: ['/images/placeholder.svg', '/images/placeholder.svg'],
    content: [
      { type: 'text', content: 'WBT is a web-based training platform designed to deliver scalable, interactive learning content across large organizations. I led product strategy and contributed directly to the frontend build, working closely with instructional designers and engineers to ship a cohesive experience.' },
      { type: 'text', content: 'The platform supports branching scenarios, progress tracking, and responsive delivery across devices. Key challenges included designing a content authoring workflow that non-technical stakeholders could use without sacrificing flexibility for developers.' },
      { type: 'image', src: '/images/placeholder.svg', alt: 'WBT content authoring interface' },
      { type: 'text', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { type: 'image', src: '/images/placeholder.svg', alt: 'WBT learner dashboard' },
      { type: 'text', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ],
    links: [],
  },
  {
    id: 'cst',
    title: 'CST',
    shortDesc: 'Enterprise tooling for a Fortune 500 client. Details under NDA.',
    nda: true,
    image: undefined,
    role: 'Product Manager',
    heroImages: ['/images/placeholder.svg'],
    content: [
      { type: 'text', content: 'This project is covered under a non-disclosure agreement. I can share that it involved building internal tooling for a large enterprise client, with a focus on workflow automation and cross-team data visibility.' },
      { type: 'text', content: 'I led discovery, defined the product roadmap, and worked with a distributed engineering team through delivery. Happy to discuss the approach and outcomes in a conversation.' },
    ],
    links: [],
  },
  {
    id: 'project-4',
    title: 'Project 4',
    shortDesc: 'Confidential client engagement. Details under NDA.',
    nda: true,
    image: undefined,
    role: 'Product Manager & Developer',
    content: [
      { type: 'text', content: 'This project is covered under a non-disclosure agreement. Available to discuss in a conversation.' },
    ],
    links: [],
  },
  {
    id: 'portfolio-v1',
    title: 'Portfolio v1',
    shortDesc: 'First iteration of my personal portfolio — designed and built from scratch.',
    nda: false,
    image: undefined,
    role: 'Designer & Developer',
    heroImages: ['/images/placeholder.svg', '/images/placeholder.svg', '/images/placeholder.svg'],
    content: [
      { type: 'text', content: 'The first version of my personal portfolio, built to establish a web presence and practice end-to-end design and development. I designed the visual identity, built the layout in vanilla HTML/CSS/JS, and iterated based on feedback.' },
      { type: 'image', src: '/images/placeholder.svg', alt: 'Portfolio v1 homepage design' },
      { type: 'text', content: 'This version taught me a lot about the gap between what looks good in a mockup and what actually works in a browser — lessons that directly shaped how I approach the current version.' },
    ],
    links: [],
  },
];
