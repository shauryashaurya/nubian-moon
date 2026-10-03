import bannerUrl from '../assets/banner-medium.png';

// Banner image imported through Vite. The import returns a URL that is
// hashed at build time and resolves correctly on GitHub Pages because
// vite.config.ts sets `base: './'`.
export default function Banner() {
  return (
    <header className="banner">
      <img className="banner-img" src={bannerUrl} alt="A Nubian Moon" />
    </header>
  );
}
