import { type BreadcrumbItem, type User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: route('settings.users.index'), // Assuming you have Ziggy for route names
    },
];

interface UserManagementIndexProps {
    users: User[];
}

export default function UserManagementIndex({ users }: UserManagementIndexProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<{
        name: string;
        email: string;
        role: string;
    }>({ name: '', email: '', role: '' });
    
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'warehouse':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'courier':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role
        });
    };

    const handleCancel = () => {
        setEditingUser(null);
    };

    const handleSave = (userId: number) => {
        router.put(route('settings.users.update', userId), editForm, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUser(null);
            }
        });
    };

    const handleDelete = (userId: number) => {
        router.delete(route('settings.users.destroy', userId), {
            preserveScroll: true,
            onSuccess: () => {
                setUserToDelete(null);
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (value: string) => {
        setEditForm(prev => ({
            ...prev,
            role: value
        }));
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
                <SettingsLayout>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="User Management" description="Manage user accounts and their roles" />
                            <Button asChild>
                                <Link href={route('settings.users.create')}>Create User</Link>
                            </Button>
                        </div>
                        <Table>
                            <TableCaption>A list of all users in the system.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.id}</TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <Input 
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleInputChange}
                                                    className="w-full"
                                                />
                                            ) : (
                                                user.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <Input 
                                                    name="email"
                                                    value={editForm.email}
                                                    onChange={handleInputChange}
                                                    className="w-full"
                                                />
                                            ) : (
                                                user.email
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingUser?.id === user.id ? (
                                                <Select 
                                                    value={editForm.role} 
                                                    onValueChange={handleRoleChange}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="warehouse">Warehouse</SelectItem>
                                                        <SelectItem value="courier">Courier</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={getRoleBadgeColor(user.role)}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {editingUser?.id === user.id ? (
                                                <div className="flex space-x-2 justify-end">
                                                    <Button 
                                                        variant="default" 
                                                        size="sm"
                                                        onClick={() => handleSave(user.id)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm"
                                                            >
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the user <strong>{user.name}</strong>. 
                                                                    This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => handleDelete(user.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={handleCancel}
                                                    >
                                                        Cancel
                                                    </Button>

                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SettingsLayout>
            </AppLayout>
        </>
    );
}
