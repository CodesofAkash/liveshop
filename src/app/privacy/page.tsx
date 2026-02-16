import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - LiveShop',
  description: 'LiveShop Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: February 15, 2026</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At LiveShop, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-3">We collect information you provide:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name and email address</li>
                <li>Phone number and shipping address</li>
                <li>Payment information (processed securely)</li>
                <li>Profile information and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Process and fulfill orders</li>
                <li>Send order confirmations and updates</li>
                <li>Improve our services</li>
                <li>Send promotional communications (with consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy concerns, contact us at: privacy@liveshop.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}