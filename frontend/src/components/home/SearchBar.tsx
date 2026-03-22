import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div 
      className={`px-4 relative z-20 transition-all duration-300 ${
        isScrolled ? '-mt-4' : 'mt-7'
      }`}
      style={{ marginTop: '28px' }}
    >
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl px-5 py-4 flex items-center gap-3 transition-all duration-300 ${
          isScrolled ? 'transform -translate-y-2' : ''
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.50)',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Rwanda..."
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </form>
    </div>
  );
}
