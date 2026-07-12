import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Stack from './components/Stack';
import Contact from './components/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function App() {
  useSmoothScroll();

  return (
    <div id="top">
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Stack />
      <Contact />
    </div>
  );
}

export default App;
