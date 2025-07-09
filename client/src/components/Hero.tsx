import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useLocation } from 'wouter';

// Cities will be fetched from database via API

export default function Hero() {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['/api/categories/active'],
  });

  const { data: cities } = useQuery({
    queryKey: ['/api/cities'],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    
    setLocation(`/services?${params.toString()}`);
  };

  return (
    <section 
      className="relative text-white py-20"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.8) 0%, rgba(239, 68, 68, 0.8) 100%), url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow fade-in">
            Professional Cleaning Services in Qatar
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 fade-in">
            Trusted by thousands of families across Doha and Al Rayyan
          </p>
          
          {/* Search Section */}
          <div className="max-w-4xl mx-auto glass-effect rounded-lg p-6 slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Select City
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full bg-white text-gray-900">
                    <SelectValue placeholder="Choose your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city: any) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-white mb-2">
                  Service Type
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white text-gray-900">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-medium transition-colors"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
