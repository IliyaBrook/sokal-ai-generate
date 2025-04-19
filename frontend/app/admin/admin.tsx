'use client'
import { UserPostList } from '@/components/posts'
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	SpinnerCentered,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
} from '@/components/ui'
import { UserDataContext } from '@/contexts/UserData.context'
import { useAuthUserFetch } from '@/hooks'
import { fetchWithRefresh } from '@/lib'
import { IPost } from '@/types'
import dynamic from 'next/dynamic'
import { Suspense, use, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface IUser {
	id: string;
	firstname: string;
	lastname: string;
	email: string;
	role: string;
	createdAt?: Date;
}
const fetchPosts = 	fetchWithRefresh<IPost[]>({
	url: `/api/posts/all`,
});
const fetchUsers = fetchWithRefresh<IUser[]>({
	url: `/api/users`
});

const AdminPage = () => {
	const contextData = useContext(UserDataContext);
	const role = contextData?.userData?.role;
	const timerId = useRef<NodeJS.Timeout | null>(null);
	const [editingUser, setEditingUser] = useState<IUser | null>(null);
	const [userEmail, setUserEmail] = useState('');
	const apiFetch = useAuthUserFetch();
	
	const initialPosts = use(fetchPosts);
	const initialUsers = use(fetchUsers);
	
	const [posts, setPosts] = useState<IPost[]>(initialPosts);
	const [users, setUsers] = useState<IUser[]>(initialUsers);
	useEffect(() => {
		setPosts(initialPosts);
	}, [initialPosts]);
	
	useEffect(() => {
		setUsers(initialUsers);
	}, [initialUsers]);
	const isAdminPromise = new Promise(resolve => {
		if (timerId.current) {
			clearTimeout(timerId.current)
		}
		timerId.current = setTimeout(() => {
			resolve(role === 'admin');
			timerId.current = null;
		}, 500)
	})
	isAdminPromise.then(isAdmin => {
		if (!isAdmin) {
			// router.push('/')
		}
	});
	const handleDeleteUser = async (userId: string) => {
		if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
			try {
				await apiFetch(`/api/users/${userId}`, {
					method: 'DELETE',
				});
				setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
				toast.success("User successfully deleted");
			} catch (error) {
				console.error("Error deleting user:", error);
				toast.error("Failed to delete user");
			}
		}
	};
	const handleEditUser = (user: IUser) => {
		setEditingUser(user);
		setUserEmail(user.email);
	};
	const handleUpdateUser = async () => {
		if (!editingUser) return;
		try {
			const updatedUser = await apiFetch<IUser>(`/api/users/${editingUser.id}`, {
				method: 'PATCH',
				body: JSON.stringify({ email: userEmail }),
			});
			
			setUsers(prevUsers => prevUsers.map(user =>
				user.id === editingUser.id ? updatedUser : user
			));
			setEditingUser(null);
			toast.success("User successfully updated");
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Failed to update user");
		}
	};
	const handleCancelEdit = () => {
		setEditingUser(null);
		setUserEmail('');
	};
	
	console.log('users: ', users)
	console.log('posts: ', posts)
	
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
			<Tabs defaultValue="posts" className="w-full">
				<TabsList className="mb-8">
					<TabsTrigger value="posts">Manage Posts</TabsTrigger>
					<TabsTrigger value="users">Manage Users</TabsTrigger>
				</TabsList>
				<TabsContent value="posts" className="space-y-4">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold mb-4">All Posts</h2>
						<UserPostList posts={posts} />
					</div>
				</TabsContent>
				<TabsContent value="users" className="space-y-4">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold mb-4">All Users</h2>
						{editingUser && (
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>Edit User: {editingUser.firstname} {editingUser.lastname}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium mb-1">Email</label>
											<input
												type="email"
												value={userEmail}
												onChange={(e) => setUserEmail(e.target.value)}
												className="w-full p-2 border rounded"
											/>
										</div>
										<div className="flex space-x-2">
											<Button onClick={handleUpdateUser}>Save Changes</Button>
											<Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						)}
						<div className="overflow-x-auto">
							<table className="min-w-full bg-white">
								<thead className="bg-gray-100">
								<tr>
									<th className="py-3 px-4 text-left">Name</th>
									<th className="py-3 px-4 text-left">Email</th>
									<th className="py-3 px-4 text-left">Role</th>
									<th className="py-3 px-4 text-left">Actions</th>
								</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
								{users.map((user) => (
									<tr key={user.id}>
										<td className="py-3 px-4">{user.firstname} {user.lastname}</td>
										<td className="py-3 px-4">{user.email}</td>
										<td className="py-3 px-4">
												<span className={`px-2 py-1 rounded text-xs ${
													user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
												}`}>
													{user.role}
												</span>
										</td>
										<td className="py-3 px-4">
											<div className="flex space-x-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditUser(user)}
												>
													Edit
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDeleteUser(user.id)}
													disabled={user.role === 'admin'}
												>
													Delete
												</Button>
											</div>
										</td>
									</tr>
								))}
								</tbody>
							</table>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}

const AdminWithSuspense = () => {
	return (
		<Suspense fallback={<SpinnerCentered/>}>
			<AdminPage />
		</Suspense>
	);
};

export const Admin = dynamic(() => Promise.resolve(AdminWithSuspense), { ssr: false })