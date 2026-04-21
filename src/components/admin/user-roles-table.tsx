
'use client';

import * as React from 'react';
import type { UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Trash2, UserPlus, FilePenLine } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUserById } from '@/lib/actions';
import { adminNavItems } from '@/lib/nav-links';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';

interface UserRolesTableProps {
  roles: UserRole[];
  onDataChange: (roles: UserRole[]) => void;
}

const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72';
const ALL_ROLES: UserRole['role'][] = ['Admin', 'Sub-Admin'];
const ALL_PERMISSIONS = adminNavItems.map(item => ({ id: item.id, label: item.label }));


export default function UserRolesTable({ roles, onDataChange }: UserRolesTableProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<UserRole | null>(null);

    const [newUserUid, setNewUserUid] = React.useState('');
    const [newUserRole, setNewUserRole] = React.useState<UserRole['role']>('Sub-Admin');
    const [newUserPermissions, setNewUserPermissions] = React.useState<string[]>([]);
    
    const handleRoleChange = (uid: string, newRole: UserRole['role']) => {
        const updatedRoles = roles.map(role => 
            role.uid === uid ? { ...role, role: newRole, permissions: newRole === 'Admin' ? ALL_PERMISSIONS.map(p => p.id) : role.permissions } : role
        );
        onDataChange(updatedRoles);
    }
    
    const handleRemoveRole = (uid: string) => {
        if (uid === PRIMARY_ADMIN_UID) {
            toast({ title: "Action Not Allowed", description: "The primary admin role cannot be removed.", variant: "destructive" });
            return;
        }
        const updatedRoles = roles.filter(role => role.uid !== uid);
        onDataChange(updatedRoles);
    }
    
    const openAddDialog = () => {
        setEditingUser(null);
        setNewUserUid('');
        setNewUserRole('Sub-Admin');
        setNewUserPermissions([]);
        setIsDialogOpen(true);
    }
    
    const openEditDialog = (user: UserRole) => {
        setEditingUser(user);
        setNewUserUid(user.uid);
        setNewUserRole(user.role);
        setNewUserPermissions(user.permissions || []);
        setIsDialogOpen(true);
    }

    const handleSaveUser = async () => {
        if (!newUserUid) {
            toast({ title: "User UID is required.", variant: "destructive" });
            return;
        }

        const finalPermissions = newUserRole === 'Admin' ? ALL_PERMISSIONS.map(p => p.id) : newUserPermissions;

        if (editingUser) {
            // Update existing user
            const updatedRoles = roles.map(r => 
                r.uid === editingUser.uid 
                ? { ...r, role: newUserRole, permissions: finalPermissions } 
                : r
            );
            onDataChange(updatedRoles);
            toast({ title: "User role updated successfully." });

        } else {
            // Add new user
            const existingUser = roles.find(r => r.uid === newUserUid);
            if (existingUser) {
                toast({ title: "User already has a role.", description: "You can edit the existing role from the table.", variant: "destructive" });
                return;
            }
            const userResult = await getUserById(newUserUid);

            if (userResult.success && userResult.user) {
                const { uid, displayName, email } = userResult.user;
                const newRole: UserRole = {
                    uid,
                    email: email || 'N/A',
                    name: displayName || 'N/A',
                    role: newUserRole,
                    permissions: finalPermissions,
                };
                onDataChange([...roles, newRole]);
                toast({ title: "User role added successfully." });
            } else {
                toast({ title: "User not found", description: userResult.error || "Could not find a user with that UID.", variant: "destructive" });
                return;
            }
        }
        
        setIsDialogOpen(false);
        setEditingUser(null);
    }
    
    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setNewUserPermissions(prev => 
            checked ? [...prev, permissionId] : prev.filter(p => p !== permissionId)
        );
    }


  return (
    <div className="space-y-4">
        <div className="flex justify-end">
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User Role
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User Role' : 'Add New User Role'}</DialogTitle>
                        <DialogDescription>
                            Enter the user's UID and configure their role and permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-uid">User UID</Label>
                            <Input
                                id="user-uid"
                                type="text"
                                placeholder="Enter Firebase User UID"
                                value={newUserUid}
                                onChange={(e) => setNewUserUid(e.target.value)}
                                disabled={!!editingUser}
                            />
                            <p className="text-xs text-muted-foreground">Contact Developer "Krishna" for UID</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Role</Label>
                            <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole['role'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_ROLES.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         {newUserRole === 'Sub-Admin' && (
                             <div className="space-y-2">
                                <Label>Permissions</Label>
                                <p className="text-xs text-muted-foreground">Select the sections this sub-admin can access.</p>
                                <div className="border rounded-md p-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                                    {ALL_PERMISSIONS.map(permission => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`perm-${permission.id}`}
                                                checked={newUserPermissions.includes(permission.id)}
                                                onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                                            />
                                            <Label htmlFor={`perm-${permission.id}`} className="text-sm font-normal">
                                                {permission.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveUser}>{editingUser ? 'Save Changes' : 'Add Role'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>UID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {roles.map((userRole) => (
                    <TableRow key={userRole.uid}>
                        <TableCell className="font-medium">{userRole.name || 'N/A'}</TableCell>
                        <TableCell>{userRole.email}</TableCell>
                        <TableCell className="font-mono text-xs">{userRole.uid}</TableCell>
                        <TableCell>
                            <Select 
                                value={userRole.role} 
                                onValueChange={(newRole) => handleRoleChange(userRole.uid, newRole as UserRole['role'])}
                                disabled={userRole.uid === PRIMARY_ADMIN_UID}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_ROLES.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {userRole.role === 'Admin' ? (
                                    <Badge>All Access</Badge>
                                ) : (
                                    userRole.permissions && userRole.permissions.map(permId => {
                                        const permission = ALL_PERMISSIONS.find(p => p.id === permId);
                                        return permission ? <Badge key={permId} variant="secondary">{permission.label}</Badge> : null;
                                    })
                                )}
                                {userRole.role === 'Sub-Admin' && (!userRole.permissions || userRole.permissions.length === 0) && (
                                     <Badge variant="destructive">No Access</Badge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(userRole)}
                                disabled={userRole.uid === PRIMARY_ADMIN_UID}
                            >
                                <FilePenLine className="h-4 w-4" />
                                <span className="sr-only">Edit Role</span>
                            </Button>
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRole(userRole.uid)}
                                disabled={userRole.uid === PRIMARY_ADMIN_UID}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove Role</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {roles.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No user roles have been configured.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}

