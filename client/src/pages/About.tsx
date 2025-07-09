import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Award, Clock, Leaf, Star } from 'lucide-react';

export default function About() {
  const stats = [
    { value: "5000+", label: "Happy Customers" },
    { value: "500+", label: "Services Completed" },
    { value: "50+", label: "Professional Cleaners" },
    { value: "4.9", label: "Average Rating" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "All our cleaning professionals are licensed, insured, and background-checked for your peace of mind."
    },
    {
      icon: Users,
      title: "Experienced Team",
      description: "Our team has over 10 years of experience in providing top-quality cleaning services across Qatar."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We guarantee 100% satisfaction with our services. If you're not happy, we'll make it right."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support and emergency cleaning services available when you need them."
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "We use environmentally safe cleaning products and sustainable practices to protect your family and the environment."
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "We use only the best cleaning equipment and premium quality products for exceptional results."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Panaroma
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Qatar's Leading Cleaning Services Provider
            </p>
            <p className="text-lg max-w-3xl mx-auto">
              For over a decade, Panaroma has been the trusted choice for professional cleaning services across Qatar. 
              We combine traditional cleaning excellence with modern technology to deliver exceptional results.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2013, Panaroma began as a small family business with a simple mission: 
                to provide reliable, professional cleaning services to the growing communities of Qatar.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we've grown to become one of Qatar's most trusted cleaning service providers, 
                serving thousands of satisfied customers across Doha, Al Rayyan, and beyond.
              </p>
              <p className="text-lg text-gray-600">
                Our commitment to excellence, attention to detail, and customer satisfaction has made us 
                the preferred choice for both residential and commercial cleaning needs.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                To provide exceptional cleaning services that exceed our customers' expectations 
                while maintaining the highest standards of professionalism and reliability.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be the leading cleaning service provider in Qatar, known for our quality, 
                reliability, and commitment to customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Panaroma?
            </h2>
            <p className="text-xl text-gray-600">
              Here's what makes us the preferred choice for cleaning services in Qatar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mr-4">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service Areas
            </h2>
            <p className="text-xl text-gray-600">
              We proudly serve customers across Qatar
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Daayen', 'Lusail', 'West Bay', 'Al Khor'].map((city) => (
              <div key={city} className="bg-white p-6 rounded-lg shadow text-center">
                <Badge variant="outline" className="mb-2">{city}</Badge>
                <p className="text-sm text-gray-600">Full service coverage</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}