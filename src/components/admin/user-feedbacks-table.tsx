
'use client';

import type { UserFeedback } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useMemo } from 'react';

interface UserFeedbacksTableProps {
  feedbacks: UserFeedback[];
  onDataChange: (feedbacks: UserFeedback[]) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

export default function UserFeedbacksTable({ feedbacks, onDataChange, selectedIds, onSelectedIdsChange }: UserFeedbacksTableProps) {
  
  const isAllSelected = useMemo(() => {
    const visibleIds = new Set(feedbacks.map(f => f.id));
    return selectedIds.length > 0 && selectedIds.every(id => visibleIds.has(id));
  }, [feedbacks, selectedIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(feedbacks.map(f => f.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleRemoveFeedback = (feedbackId: string) => {
    const updatedFeedbacks = feedbacks.filter(fb => fb.id !== feedbackId);
    onDataChange(updatedFeedbacks);
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="border rounded-lg overflow-hidden">
        <div className="relative overflow-y-auto min-h-[55vh] max-h-[55vh]">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-secondary hover:bg-secondary">
                        <TableHead className="px-4">
                           <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                aria-label="Select all feedbacks"
                            />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {feedbacks.map((feedback) => (
                        <TableRow key={feedback.id} className="hover:bg-transparent" data-state={selectedIds.includes(feedback.id) ? 'selected' : ''}>
                             <TableCell className="px-4">
                                <Checkbox
                                    checked={selectedIds.includes(feedback.id)}
                                    onCheckedChange={(checked) => handleSelectOne(feedback.id, !!checked)}
                                    aria-label={`Select feedback from ${feedback.name}`}
                                />
                             </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={feedback.avatar} alt={feedback.name} />
                                        <AvatarFallback>{getInitials(feedback.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{feedback.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{feedback.email || 'N/A'}</TableCell>
                            <TableCell>
                                <p className="max-w-md text-sm text-muted-foreground">{feedback.feedback}</p>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="font-bold mr-1">{feedback.rating}</span>
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveFeedback(feedback.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Remove Feedback</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {feedbacks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No user feedbacks found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
