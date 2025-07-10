import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ServiceCard from '@/components/ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin } from 'lucide-react';

// Cities will be fetched from database via API

export default function Services() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCity = urlParams.get('city') || '';
    const urlCategory = urlParams.get('category') || '';
    
    console.log('URL Parameters:', { urlCity, urlCategory, location, windowSearch: window.location.search });
    
    setSelectedCity(urlCity);
    setSelectedCategory(urlCategory);
    setIsInitialized(true);
  }, [location]);

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', searchQuery, selectedCategory, selectedCity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== '') {
        params.set('category', selectedCategory);
      }
      if (selectedCity && selectedCity !== 'all' && selectedCity !== '') {
        params.set('city', selectedCity);
      }
      
      const response = await fetch(`/api/services?${params.toString()}`);
      return response.json();
    },
    enabled: isInitialized, // Only run query after URL parameters are parsed
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories/active'],
  });

  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    select: (data) => data?.map((fav: any) => fav.serviceId) || [],
  });

  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
    select: (data) => data?.map((item: any) => item.serviceId) || [],
  });

  const { data: cities } = useQuery({
    queryKey: ['/api/cities'],
  });

  const handleSearch = () => {
    // Trigger refetch with current filters
  };

  // Since filtering is done on server-side, just sort the services
  const sortedServices = [...(services || [])].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'duration':
        return a.duration - b.duration;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-white/5 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cleaning Services in Qatar
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Professional cleaning solutions for homes and offices across Qatar
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map((city: any) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Service Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {(selectedCity || selectedCategory) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedCity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedCity}
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {categories?.find((cat: any) => cat.id.toString() === selectedCategory)?.name || 'Category'}
              </Badge>
            )}
          </div>
        )}

        {/* Debug Info */}
        {selectedCategory && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Debug: Category Filter Applied - ID: {selectedCategory}
            </p>
          </div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {servicesLoading ? 'Loading...' : `${sortedServices.length} Services Found`}
          </h2>
        </div>

        {/* Services Grid */}
        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No services found matching your criteria.</div>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
                setSelectedCategory('');
              }}
              className="mt-4"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedServices.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                isFavorite={favorites?.includes(service.id)}
                isInCart={cartItems?.includes(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
