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
      className="relative text-white py-24 md:py-32"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 138, 0.7) 100%), url('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-600/20 rounded-full text-sm font-medium border border-blue-400/30">
              Qatar's Premier Facilities Management
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Excellence in
            <span className="block text-transparent bg-gradient-to-r from-blue-200 to-white bg-clip-text">
              Facilities Management
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Professional cleaning and maintenance services across Qatar. Trusted by leading businesses and thousands of satisfied customers.
          </p>
          
          {/* Search Section */}
          <div className="max-w-5xl mx-auto bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-white">Find Your Perfect Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Select City
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full bg-white/90 text-gray-900 border-0 h-12">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">
                  Service Type
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white/90 text-gray-900 border-0 h-12">
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
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 transition-all hover:scale-105"
                >
                  <Search className="mr-2 h-5 w-5" />
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
