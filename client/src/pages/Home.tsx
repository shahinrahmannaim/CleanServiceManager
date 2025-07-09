import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Leaf, Star, Users, Award } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  const { data: promotions, isLoading: promotionsLoading } = useQuery({
    queryKey: ['/api/promotions'],
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories/active'],
  });

  const featuredServices = services?.slice(0, 6) || [];

  const features = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "All our cleaning professionals are licensed, insured, and background-checked",
      color: "bg-primary"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency cleaning services",
      color: "bg-accent"
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "We use environmentally safe cleaning products and sustainable practices",
      color: "bg-green-600"
    }
  ];

  const { data: testimonials } = useQuery({
    queryKey: ['/api/testimonials'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Promotional Banners */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {promotionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="promotional-card gradient-accent animate-pulse">
                  <div className="h-6 bg-white/30 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotions?.slice(0, 3).map((promo: any) => (
                <div key={promo.id} className="promotional-card gradient-accent">
                  <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-red-100">{promo.description}</p>
                </div>
              )) || <div className="text-center text-gray-500">No promotions available</div>}
            </div>
          )}
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Cleaning Services
            </h2>
            <p className="text-xl text-gray-600">Professional cleaning solutions for every need</p>
          </div>
          
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/services">
              <Button className="btn-primary text-lg px-8 py-3">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Panaroma?
            </h2>
            <p className="text-xl text-gray-600">Trusted by thousands of satisfied customers across Qatar</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className={`${feature.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="text-white text-2xl" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats?.map((stat: any) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            )) || []}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">Real reviews from satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial: any) => (
              <Card key={testimonial.name} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500 review-stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{testimonial.rating}.0</span>
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Download Our Mobile App</h2>
              <p className="text-xl mb-8 text-white/90">
                Get instant access to all our services on your mobile device. Book, track, and manage your cleaning services on the go.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Coming Soon</div>
                    <div className="text-xs text-white/70">App Store</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Coming Soon</div>
                    <div className="text-xs text-white/70">Google Play</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-white/70">
                🚧 Currently in development - Stay tuned for the official release!
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-96 bg-white/20 backdrop-blur-sm rounded-3xl p-4">
                  <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img 
                          src="/logo.jpeg" 
                          alt="Panaroma App" 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/logo.svg";
                            target.className = "w-10 h-10 rounded-lg object-cover";
                          }}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Panaroma App</h3>
                      <p className="text-sm text-white/70">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-accent to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">Join thousands of satisfied customers across Qatar</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button className="bg-white hover:bg-gray-100 text-primary px-8 py-3 text-lg font-medium">
                Book a Service Now
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-medium border-2 border-white">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
