
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  const policies = [
    "We collect personal information such as name, phone number, and pickup/drop-off location during the booking process.",
    "Your data is used to assign drivers, confirm bookings, and provide customer support.",
    "We take reasonable measures to protect your information from unauthorized access.",
    "Booking and transaction data may be stored for accounting and compliance.",
    "Our website may use cookies to improve user experience. You can disable cookies in your browser settings.",
    "We may update this Privacy Policy from time to time. Any changes will be posted on our website with the updated effective date. Continued use of our services implies acceptance of the latest version."
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 list-disc pl-5 text-muted-foreground">
            {policies.map((policy, index) => (
              <li key={index}>{policy}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
