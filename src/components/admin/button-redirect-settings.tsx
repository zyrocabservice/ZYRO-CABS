
'use client';

import type { ButtonSettings, ButtonRedirectAction } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Facebook } from 'lucide-react';
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WhatsAppIcon = (props: { className?: string }) => (
    <Image
        src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Gemini_Generated_Image_o9olf5o9olf5o9ol-Photoroom.png"
        alt="WhatsApp"
        width={20}
        height={20}
        className={props.className}
    />
);

const InstagramIcon = (props: { className?: string }) => (
    <Image
        src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Gemini_Generated_Image_waiva8waiva8waiv-Photoroom.png"
        alt="Instagram"
        width={20}
        height={20}
        className={props.className}
    />
);

interface ButtonRedirectSettingsProps {
    settings: ButtonSettings;
    onDataChange: (settings: ButtonSettings) => void;
}

const actionOptions: { value: ButtonRedirectAction, label: string, icon: React.ElementType }[] = [
    { value: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
];

export default function ButtonRedirectSettings({ settings, onDataChange }: ButtonRedirectSettingsProps) {

    const handleSettingChange = (key: keyof ButtonSettings, value: ButtonRedirectAction) => {
        onDataChange({ ...settings, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-base font-semibold">"Enquire Now" Button Action</Label>
                <p className="text-sm text-muted-foreground">
                    This controls the action for the "Enquire Now" button found on car cards.
                </p>
                <Select 
                    value={settings.enquireNowAction} 
                    onValueChange={(value) => handleSettingChange('enquireNowAction', value as ButtonRedirectAction)}
                >
                    <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                        {actionOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                    <option.icon className="h-5 w-5" />
                                    <span>{option.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
