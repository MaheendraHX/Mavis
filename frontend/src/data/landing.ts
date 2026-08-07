export type Feature = {
  index: string;
  title: string;
  description: string;
  icon: 'layers' | 'search' | 'brain' | 'code' | 'shield' | 'zap';
};

export const features: Feature[] = [
{
  index: '01',
  title: 'Multimodal understanding',
  description:
  'Drop in an image, a PDF, a spreadsheet or a screenshot. Mavis reads it and answers in the same breath.',
  icon: 'layers'
},
{
  index: '02',
  title: 'Real-time web search',
  description:
  'Every answer can reach the live web, and every claim arrives with the sources it came from.',
  icon: 'search'
},
{
  index: '03',
  title: 'Context-aware memory',
  description:
  'Threads remember what matters — decisions, names, preferences — so you stop repeating yourself.',
  icon: 'brain'
},
{
  index: '04',
  title: 'Code & creative suite',
  description:
  'Syntax-highlighted code, drafts, rewrites and exports. Ship the artifact, not just the reply.',
  icon: 'code'
},
{
  index: '05',
  title: 'Privacy first',
  description:
  'Incognito threads leave nothing behind. Your keys, your session, your history to delete.',
  icon: 'shield'
},
{
  index: '06',
  title: 'Lightning fast',
  description:
  'Groq and Gemini side by side. Switch providers mid-conversation without losing the thread.',
  icon: 'zap'
}];


export const steps = [
{
  step: 'One',
  title: 'Start a conversation',
  description: 'Open a thread as owner or guest. No setup, no onboarding maze.'
},
{
  step: 'Two',
  title: 'Attach or ask',
  description: 'Type a question, paste a link, or drag in a file. Pick a persona if you like.'
},
{
  step: 'Three',
  title: 'Get results',
  description: 'Cited answers, runnable code, exportable documents — organized by thread.'
}];


export const techStack = [
'React',
'Three.js',
'FastAPI',
'Python',
'GSAP',
'DuckDuckGo',
'Vite',
'Render',
'Vercel'];


export const navLinks = [
{ label: 'Features', href: '#features' },
{ label: 'How it works', href: '#how-it-works' },
{ label: 'Tech', href: '#tech' }];