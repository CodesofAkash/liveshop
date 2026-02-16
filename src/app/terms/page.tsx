import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions - LiveShop',
  description: 'LiveShop Terms & Conditions',
};

export default function TermsPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last updated: February 15, 2026</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By using LiveShop, you agree to these Terms and Conditions. Please read carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Use of Service</h2>
              <p className="text-muted-foreground mb-3">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate information</li>
                <li>Not violate any laws</li>
                <li>Not engage in fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Orders and Payments</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>All prices are in Indian Rupees (INR)</li>
                <li>Payment must be completed before order processing</li>
                <li>Returns subject to our return policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact</h2>
              <p className="text-muted-foreground">
                Questions? Contact us at: legal@liveshop.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}