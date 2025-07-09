import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+974 4444 5555", "+974 7777 8888"],
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@panaroma.com", "support@panaroma.com"],
      color: "text-green-600"
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Business District", "Doha, Qatar"],
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Mon - Fri: 7:00 AM - 8:00 PM", "Sat - Sun: 8:00 AM - 6:00 PM"],
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Get in touch with our friendly team
            </p>
            <p className="text-lg max-w-3xl mx-auto">
              Have questions about our services? Need a custom quote? 
              We're here to help you with all your cleaning needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info) => (
              <Card key={info.title} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                    <info.icon className={`w-8 h-8 ${info.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                  {info.details.map((detail, index) => (
                    <p key={index} className="text-gray-600 mb-1">{detail}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible. 
                For urgent matters, please call us directly.
              </p>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Contact Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+974 XXXX XXXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is this regarding?"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Emergency Services
              </h3>
              <Card className="shadow-lg mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Phone className="w-6 h-6 text-red-600 mr-3" />
                    <span className="text-lg font-semibold">24/7 Emergency Line</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mb-2">+974 9999 0000</p>
                  <p className="text-gray-600">
                    For urgent cleaning emergencies, water damage, or after-hours support.
                  </p>
                </CardContent>
              </Card>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Response Areas
              </h3>
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Daayen', 'Lusail'].map((city) => (
                      <div key={city} className="flex items-center">
                        <MapPin className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Average response time: 2-4 hours for standard services, 
                    30 minutes for emergencies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}