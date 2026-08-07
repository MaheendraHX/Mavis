export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: {title: string;domain: string;}[];
  code?: {language: string;body: string;};
};

export type Conversation = {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
};

export const conversations: Conversation[] = [
{
  id: 'c1',
  title: 'Compare Groq vs Gemini latency',
  timestamp: 'Today',
  messages: [
  {
    id: 'm1',
    role: 'user',
    content: 'Which provider should I default to for short chat replies, Groq or Gemini?'
  },
  {
    id: 'm2',
    role: 'assistant',
    content:
    'For short conversational turns, Groq is the better default — its time-to-first-token is consistently lower, which is what users actually feel. Keep Gemini as the fallback for long-context and image-heavy requests, where the throughput advantage matters more than the first token.',
    sources: [
    { title: 'Inference latency benchmarks, 2026', domain: 'artificialanalysis.ai' },
    { title: 'Gemini long-context pricing', domain: 'ai.google.dev' }]

  },
  {
    id: 'm3',
    role: 'user',
    content: 'Show me how to switch providers per request.'
  },
  {
    id: 'm4',
    role: 'assistant',
    content: 'Send the provider along with the message and let the backend route it:',
    code: {
      language: 'ts',
      body: `await fetch("/chat", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    message,\n    session_id: sessionId,\n    model_provider: isShortTurn ? "groq" : "gemini",\n    web_search: true,\n  }),\n});`
    }
  }]

},
{
  id: 'c2',
  title: 'Summarize Q3 research deck',
  timestamp: 'Yesterday',
  messages: []
},
{
  id: 'c3',
  title: 'Rewrite onboarding email',
  timestamp: 'Yesterday',
  messages: []
},
{
  id: 'c4',
  title: 'Parse invoice screenshot',
  timestamp: 'Mar 12',
  messages: []
}];


export const personas = ['Default', 'Analyst', 'Engineer', 'Editor'];