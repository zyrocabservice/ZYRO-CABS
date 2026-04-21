
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings } from 'lucide-react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'zyro_cookie_consent_v2';

type ConsentSettings = {
    necessary: boolean;
    analytics: boolean;
};

const defaultSettings: ConsentSettings = {
    necessary: true,
    analytics: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>(defaultSettings);

  useEffect(() => {
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      setShowBanner(true);
    } else {
        // If consent is already stored, ensure analytics is loaded if permitted
        const parsedConsent: ConsentSettings = JSON.parse(storedConsent);
        if (parsedConsent.analytics) {
            window.dispatchEvent(new CustomEvent('load-analytics'));
        }
    }
  }, []);

  const saveConsent = (newConsent: ConsentSettings) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setShowBanner(false);
    setShowPreferences(false);
    if (newConsent.analytics) {
        window.dispatchEvent(new CustomEvent('load-analytics'));
    }
  };

  const handleAcceptAll = () => {
    const allConsent: ConsentSettings = { necessary: true, analytics: true };
    setConsent(allConsent);
    saveConsent(allConsent);
  };
  
  const handleDeclineAll = () => {
    const declineConsent: ConsentSettings = { necessary: true, analytics: false };
    setConsent(declineConsent);
    saveConsent(declineConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  const handleToggle = (category: keyof Omit<ConsentSettings, 'necessary'>, checked: boolean) => {
    setConsent(prev => ({ ...prev, [category]: checked }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-in-from-bottom">
            <Card className="max-w-screen-lg mx-auto shadow-2xl">
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
                        <div className="flex items-start gap-4">
                            <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold">We Use Cookies</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our website uses cookies to ensure its proper operation and to understand how you interact with it. See our <Link href="/privacy" className="underline">Privacy Policy</Link> for more details.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 self-center">
                            <Button onClick={handleAcceptAll} className="w-full sm:w-auto">Accept All</Button>
                             <Button variant="outline" onClick={handleDeclineAll} className="w-full sm:w-auto">Decline All</Button>
                            <Button variant="ghost" onClick={() => setShowPreferences(true)} className="w-full sm:w-auto">
                                <Settings className="mr-2 h-4 w-4" />
                                Manage
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cookie Preferences</DialogTitle>
                    <DialogDescription>
                        Manage your cookie settings. You can enable or disable different types of cookies below.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary">
                        <div>
                            <Label htmlFor="necessary-cookies" className="font-semibold">Strictly Necessary</Label>
                            <p className="text-xs text-muted-foreground">These cookies are essential for the website to function and cannot be disabled.</p>
                        </div>
                        <Switch id="necessary-cookies" checked={true} disabled />
                    </div>
                     <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <Label htmlFor="analytics-cookies" className="font-semibold">Analytics Cookies</Label>
                            <p className="text-xs text-muted-foreground">These cookies allow us to analyze site usage and improve performance.</p>
                        </div>
                        <Switch 
                            id="analytics-cookies" 
                            checked={consent.analytics} 
                            onCheckedChange={(checked) => handleToggle('analytics', checked)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSavePreferences}>Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
