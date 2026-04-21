
'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { uploadTollDataToSupabase, clearTollData } from '@/lib/actions';
import type { TollPlaza } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileJson, Hash } from 'lucide-react';

interface TollDataUploaderProps {
    currentTollCount: number;
    onUploadSuccess: (newCount: number) => void;
}

export default function TollDataUploader({ currentTollCount, onUploadSuccess }: TollDataUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState<TollPlaza[] | null>(null);
    const [isUploading, startUploading] = useTransition();
    const [isDeleting, startDeleting] = useTransition();
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/json') {
                toast({
                    title: "Invalid File Type",
                    description: "Please select a valid JSON file.",
                    variant: "destructive"
                });
                return;
            }

            setFile(selectedFile);
            setFileName(selectedFile.name);

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = JSON.parse(event.target?.result as string);
                    if (Array.isArray(content)) {
                        setFileContent(content);
                    } else {
                        throw new Error("JSON file is not an array.");
                    }
                } catch (error) {
                    toast({
                        title: "JSON Parse Error",
                        description: `Could not parse the file: ${(error as Error).message}`,
                        variant: "destructive"
                    });
                    setFile(null);
                    setFileName('');
                    setFileContent(null);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleUpload = () => {
        if (!fileContent) {
            toast({
                title: "No Data",
                description: "No valid file content to upload.",
                variant: "destructive"
            });
            return;
        }

        startUploading(async () => {
            const result = await uploadTollDataToSupabase(fileContent);

            if (result.success && result.count !== undefined) {
                onUploadSuccess(result.count);
                toast({
                    title: "Data Updated",
                    description: `Successfully updated toll data with ${result.count} records.`,
                });
                setFile(null);
                setFileName('');
                setFileContent(null);
            } else {
                 toast({
                    title: "Update Failed",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive"
                });
            }
        });
    };

    const handleDelete = () => {
        if (deleteConfirmation !== 'DELETE') {
            return;
        }

        startDeleting(async () => {
            const result = await clearTollData();
            if (result.success && result.count !== undefined) {
                onUploadSuccess(result.count);
                toast({
                    title: "Data Cleared",
                    description: "All toll plaza data has been successfully deleted.",
                });
                setDeleteConfirmation(''); // Reset confirmation
            } else {
                toast({
                    title: "Deletion Failed",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border rounded-lg flex justify-between items-center bg-secondary">
                <h4 className="font-semibold">Current Toll Plazas in Database</h4>
                <p className="text-2xl font-bold text-primary">{currentTollCount}</p>
            </div>
            
             {fileContent && (
                <Card>
                    <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">Selected File Details</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-4 h-4" />
                                <span>File Name: <span className="font-medium text-foreground">{fileName}</span></span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                <span>Records Found: <span className="font-medium text-foreground">{fileContent.length}</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <Label htmlFor="toll-file">Upload New Toll Data (JSON)</Label>
                <div className="flex gap-2">
                    <Input id="toll-file" type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                    <Label htmlFor="toll-file" className="flex-grow border rounded-md p-2 flex items-center justify-center cursor-pointer hover:bg-muted">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        <span>{fileName || "Choose a JSON file"}</span>
                    </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                    Uploading a new file will completely replace the existing toll dataset.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleUpload} disabled={!fileContent || isUploading || isDeleting} className="w-full">
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Upload and Replace Data'}
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isUploading || isDeleting || currentTollCount === 0} className="w-full">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All Toll Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all toll plaza data from the database.
                                <br/><br/>
                                Please type <strong className="text-destructive">DELETE</strong> to confirm.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder='Type "DELETE" to confirm'
                        />
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deleteConfirmation !== 'DELETE' || isDeleting}>
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
