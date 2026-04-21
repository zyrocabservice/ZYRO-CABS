
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  const terms = [
    "All bookings must be made through our official website.",
    "We aim to assign a driver within 1 hour of booking confirmation.",
    "Bookings are subject to driver availability.",
    "Fare is calculated based on distance (KM) and vehicle type selected.",
    "Final fare will be communicated before ride confirmation.",
    "Zyro Cabs does not charge customers directly; payment is made to the driver.",
    "Zyro Cabs is a booking facilitator and is not liable for delays, accidents, or service issues caused by drivers.",
    "Customers are advised to ensure their belongings are not left behind in the vehicle.",
    "All drivers are expected to behave professionally and follow traffic rules.",
    "Any misconduct should be reported immediately via our contact page.",
    "Customers must treat drivers with respect and avoid any abusive behavior.",
    "Zyro Cabs reserves the right to refuse service to customers who violate these terms.",
    "Customer data is collected only for booking and communication purposes.",
    "We do not share personal information with third parties without consent."
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 list-disc pl-5 text-muted-foreground">
            {terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
