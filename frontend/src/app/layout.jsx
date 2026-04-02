import '../styles/globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'NexusAI-DB — AI Model Recommendation System',
  description: 'Discover and compare 20 frontier AI models. Get algorithmic recommendations tailored to your use case.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Animated background */}
        <div className="bg-canvas" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
