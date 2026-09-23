import PROJECTS from './data/projects.js';
import Stage from './stage/Stage.jsx';
import useSmoothScroll from './stage/useSmoothScroll.js';
import Nav from './ui/Nav.jsx';
import Opening from './chapters/Opening.jsx';
import SystemsIndex from './chapters/SystemsIndex.jsx';
import Compact from './chapters/Compact.jsx';
import StackExp from './chapters/StackExp.jsx';
import About from './chapters/About.jsx';
import Contact from './chapters/Contact.jsx';
import FlowChapter from './flow/FlowChapter.jsx';
import AgentConsole from './agent/AgentConsole.jsx';

const flowProjects = PROJECTS.filter((p) => p.flow);
const compactProjects = PROJECTS.filter((p) => !p.flow);
const workOrder = [...flowProjects, ...compactProjects];
const nextIdOf = (i) => (workOrder[i + 1] ? `work-${workOrder[i + 1].id}` : 'stack');

export default function App() {
  useSmoothScroll();

  return (
    <>
      <a href="#systems" className="skip-link mono">Skip to work</a>
      <Nav />
      <Stage>
        <Opening />
        <SystemsIndex />
        {flowProjects.map((p, i) => (
          <FlowChapter key={p.id} project={p} index={i + 1} nextId={nextIdOf(i)} />
        ))}
        {compactProjects.map((p, i) => (
          <Compact key={p.id} project={p} index={flowProjects.length + i + 1} />
        ))}
        <StackExp />
        <About />
        <Contact />
      </Stage>
      <AgentConsole />
    </>
  );
}
