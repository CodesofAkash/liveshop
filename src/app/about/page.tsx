import { Card, CardContent } from '@/components/ui/card';
import { Store, Users, TrendingUp, Heart, Shield, Package } from 'lucide-react';

export const metadata = {
  title: 'About Us - LiveShop',
  description: 'Learn about LiveShop and our mission',
};

export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About LiveShop</h1>
          <p className="text-xl text-muted-foreground">
            Your trusted e-commerce platform for quality products
          </p>
        </div>

        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At LiveShop, we're committed to providing a seamless shopping experience that connects
              buyers with quality products from trusted sellers. We believe in transparency, security,
              and customer satisfaction above all else.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Secure Shopping</h3>
                <p className="text-sm text-muted-foreground">
                  Your data and payments are protected with industry-leading security
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and reliable shipping to your doorstep
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is always here to help you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10k+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Sellers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5k+</div>
              <p className="text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}