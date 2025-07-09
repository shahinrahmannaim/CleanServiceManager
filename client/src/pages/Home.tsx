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

  const testimonials = [
    {
      name: "Ahmed Al-Rashid",
      location: "Doha, Qatar",
      rating: 5,
      comment: "Excellent service! The team was professional, punctual, and did an amazing job cleaning our villa. Highly recommend!"
    },
    {
      name: "Sarah Johnson",
      location: "Al Rayyan, Qatar",
      rating: 5,
      comment: "Perfect AC cleaning service! They were thorough and my AC is working better than ever. Great value for money."
    },
    {
      name: "Mohammed Al-Thani",
      location: "West Bay, Qatar",
      rating: 5,
      comment: "Outstanding office cleaning service! Our workspace has never looked better. Professional and reliable team."
    }
  ];

  const stats = [
    { value: "5000+", label: "Happy Customers" },
    { value: "500+", label: "Services Completed" },
    { value: "50+", label: "Professional Cleaners" },
    { value: "4.9", label: "Average Rating" }
  ];

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
              )) || (
                <>
                  <div className="promotional-card gradient-accent">
                    <h3 className="text-2xl font-bold mb-2">25% Off First Booking</h3>
                    <p className="text-red-100">New customers enjoy special discount</p>
                  </div>
                  <div className="promotional-card gradient-primary">
                    <h3 className="text-2xl font-bold mb-2">Same Day Service</h3>
                    <p className="text-blue-100">Book before 12 PM for same-day cleaning</p>
                  </div>
                  <div className="promotional-card bg-gradient-to-r from-green-500 to-green-600">
                    <h3 className="text-2xl font-bold mb-2">Satisfaction Guaranteed</h3>
                    <p className="text-green-100">100% satisfaction or money back</p>
                  </div>
                </>
              )}
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
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
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
            {testimonials.map((testimonial) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of satisfied customers across Qatar</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg font-medium">
                Book a Service Now
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white hover:bg-gray-100 text-primary px-8 py-3 text-lg font-medium">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
