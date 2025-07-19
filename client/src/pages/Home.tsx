import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import PromotionSection from '@/components/PromotionSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  Leaf, 
  Star, 
  Users, 
  Award,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories/active'],
  });

  const { data: testimonials } = useQuery({
    queryKey: ['/api/testimonials'],
    staleTime: 60 * 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 60 * 60 * 1000,
  });

  const featuredServices = services?.slice(0, 6) || [];

  const features = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "All our professionals are licensed, insured, and background-checked for your peace of mind",
      stats: "100% Verified"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency services available when you need us most",
      stats: "Same Day Service"
    },
    {
      icon: Award,
      title: "Quality Guarantee", 
      description: "We stand behind our work with a satisfaction guarantee on every service we provide",
      stats: "99% Satisfaction"
    }
  ];

  const benefits = [
    "Professional trained staff",
    "Eco-friendly cleaning products", 
    "Flexible scheduling options",
    "Competitive pricing",
    "Quality assurance program",
    "Emergency service available"
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Promotion Section */}
      <PromotionSection />
      
      {/* Trust Indicators */}
      <section className="py-8 bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Licensed & Insured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">5000+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Same Day Service</span>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              Our Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Professional Facilities Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive cleaning and maintenance solutions tailored for homes, offices, and commercial spaces across Qatar
            </p>
          </div>
          
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service: any) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link href="/services">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg group">
                Explore All Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Qatar's Most Trusted Facilities Management
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                We've built our reputation on delivering exceptional service quality, reliability, and customer satisfaction across Qatar.
              </p>
              
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link href="/services">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started Today
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                          <Badge variant="secondary" className="text-xs">{feature.stats}</Badge>
                        </div>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 from-blue-600 to-blue-800 text-white bg-[#d91c38]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Thousands Across Qatar
            </h2>
            <p className="text-xl text-blue-100">
              Our track record speaks for itself
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats?.map((stat: any) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-lg font-medium">{stat.label}</div>
              </div>
            )) || []}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              Customer Reviews
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real feedback from satisfied customers who trust us with their facilities management needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial: any) => (
              <Card key={testimonial.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">{testimonial.rating}.0</span>
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{testimonial.comment}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-20 bg-[#cad1e0] text-[#1e1945]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-blue-400 border-blue-400">
                Get In Touch
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
                Ready to Experience Excellence?
              </h2>
              <p className="text-xl mb-8 text-[#162e4a]">
                Contact us today for a free consultation and discover why Qatar's leading businesses trust Panaroma with their facilities management needs.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-lg p-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Call Us</p>
                    <p className="text-slate-300">+974 4444 5555</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-lg p-3">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <p className="text-slate-300">info@panaroma.qa</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-lg p-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Visit Us</p>
                    <p className="text-slate-300">Doha, Qatar</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-blue-900">Get a Free Quote</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-900">Service Type</label>
                    <select className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-blue-900 placeholder-blue-900/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="" className="text-blue-900">Select a service</option>
                      <option value="house-cleaning" className="text-blue-900">House Cleaning</option>
                      <option value="office-cleaning" className="text-blue-900">Office Cleaning</option>
                      <option value="commercial-cleaning" className="text-blue-900">Commercial Cleaning</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Contact Information</label>
                    <input 
                      type="text" 
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg">
                    Get Free Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 from-blue-600 to-blue-800 text-white bg-[#2a2c37]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of satisfied customers across Qatar who trust us with their facilities management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-white hover:bg-slate-100 text-blue-600 px-8 py-4 text-lg font-semibold group">
                Book a Service Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
