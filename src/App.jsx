import PROJECTS from './data/projects.js';
import Stage from './stage/Stage.jsx';
import useSmoothScroll from './stage/useSmoothScroll.js';
import Nav from './ui/Nav.jsx';
import Opening from './chapters/Opening.jsx';
import Premise from './chapters/Premise.jsx';
import Compact from './chapters/Compact.jsx';
import StackExp from './chapters/StackExp.jsx';
import About from './chapters/About.jsx';
import Contact from './chapters/Contact.jsx';
import FlowChapter from './flow/FlowChapter.jsx';

const flowProjects = PROJECTS.filter((p) => p.flow);
const compactProjects = PROJECTS.filter((p) => !p.flow);

export default function App() {
  useSmoothScroll();

  return (
    <>
      <Nav />
      <Stage>
        <Opening />
        <Premise />
        {flowProjects.map((p) => <FlowChapter key={p.id} project={p} />)}
        {compactProjects.map((p) => <Compact key={p.id} project={p} />)}
        <StackExp />
        <About />
        <Contact />
      </Stage>
    </>
  );
}
