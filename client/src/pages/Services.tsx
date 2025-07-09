import { useState } from 'react';
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

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const initialCity = urlParams.get('city') || '';
  const initialCategory = urlParams.get('category') || '';

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', searchQuery, selectedCategory || initialCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory || initialCategory) params.set('category', selectedCategory || initialCategory);
      
      const response = await fetch(`/api/services?${params.toString()}`);
      return response.json();
    },
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

  const filteredServices = services?.filter((service: any) => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const sortedServices = [...filteredServices].sort((a, b) => {
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
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cleaning Services in Qatar
            </h1>
            <p className="text-xl text-gray-600">
              Professional cleaning solutions for homes and offices
            </p>
          </div>
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
                  <SelectItem value="">All Cities</SelectItem>
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
                  <SelectItem value="">All Categories</SelectItem>
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
        {(selectedCity || selectedCategory || initialCity || initialCategory) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {(selectedCity || initialCity) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {selectedCity || initialCity}
              </Badge>
            )}
            {(selectedCategory || initialCategory) && (
              <Badge variant="secondary">
                {categories?.find((cat: any) => cat.id.toString() === (selectedCategory || initialCategory))?.name}
              </Badge>
            )}
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
