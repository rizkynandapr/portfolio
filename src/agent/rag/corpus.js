// The agent's knowledge base: every chunk is text that already appears on the
// site, with a link back to where it lives. Built once, used by the in-browser
// search and (if a key is ever set) by /api/chat to keep prompts small.
import PROJECTS from '../../data/projects.js';
import { IDENTITY, LINKS, ROLES, STACK, EDUCATION, NOW, STORY, PRINCIPLES } from '../../data/profile.js';

export function buildCorpus() {
  const chunks = [];
  const add = (c) => chunks.push({ keywords: '', ...c });

  add({
    id: 'identity',
    kind: 'identity',
    title: IDENTITY.name,
    href: '#top',
    text: `${IDENTITY.name}, known as ${IDENTITY.short}, is an ${IDENTITY.role} based in ${IDENTITY.base}. He builds WhatsApp AI agents, RAG systems and n8n automations for businesses.`,
    keywords: 'who is rizky about introduction profile engineer',
  });

  add({
    id: 'now',
    kind: 'now',
    title: 'Right now',
    href: '#about',
    text: `${NOW.status}: ${NOW.detail}. Before that: ${NOW.previous}. Base: ${NOW.base}.`,
    keywords: 'current job now today latest employer company cekat work next position status',
  });

  add({
    id: 'contact',
    kind: 'contact',
    title: 'Contact',
    href: '#contact',
    text: `Email ${IDENTITY.email} is the fastest way to reach him. He is also on ${LINKS.map((l) => l.label).join(', ')}. The CV is a download at ${IDENTITY.cv}.`,
    keywords: 'contact email reach hire message cv resume download github linkedin hugging face',
  });

  add({
    id: 'education',
    kind: 'education',
    title: 'Education',
    href: '#about',
    text: `${EDUCATION.join('. ')}.`,
    keywords: 'education degree university college study bootcamp school graduate informatics',
  });

  add({
    id: 'stack',
    kind: 'stack',
    title: 'Stack and tools',
    href: '#stack',
    text: STACK.map((g) => `${g.label}: ${g.items.join(', ')}`).join('. ') + '.',
    keywords: 'stack tools skills technologies languages frameworks tech use uses using software',
  });

  STORY.forEach((p, i) => add({ id: `story-${i}`, kind: 'story', title: 'His story', href: '#about', text: p, keywords: 'story background journey career start history' }));

  PRINCIPLES.forEach((p, i) => add({ id: `principle-${i}`, kind: 'principle', title: p.title, href: '#about', text: p.body, keywords: 'approach how he works method principle' }));

  ROLES.forEach((r, i) => add({
    id: `role-${i}`,
    kind: 'role',
    title: `${r.title}, ${r.org}`,
    href: '#stack',
    text: r.points.length
      ? r.points.join('. ') + '.'
      : `${r.title} at ${r.org} in ${r.location}, starting ${r.start ?? r.period}.`,
    meta: r,
    keywords: `experience job work role position ${r.org} ${r.title} ${r.location}`,
  }));

  PROJECTS.forEach((p) => {
    const href = `#work-${p.id}`;
    add({
      id: `project-${p.id}`,
      kind: 'project',
      title: p.name,
      href,
      text: `${p.problem} ${p.build}`,
      meta: p,
      keywords: `project ${p.name} ${p.tag} ${p.kind} ${p.stack.join(' ')} ${p.metric?.label ?? ''}`,
    });
    (p.flow ?? []).forEach((n, j) => add({
      id: `node-${p.id}-${j}`,
      kind: 'node',
      title: `${p.name} · ${n.label}`,
      href,
      text: n.detail,
      meta: { project: p.name, label: n.label },
      keywords: `${p.name} ${n.label} pipeline step`,
    }));
  });

  return chunks;
}
