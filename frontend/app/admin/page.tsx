'use client'

import { UserDataContext } from '@/contexts/UserData.context'
import { useRouter } from 'next/navigation'
import { useContext, useRef } from 'react'

const AdminPage = () => {
	const contextData= useContext(UserDataContext);
	const role = contextData?.userData?.role;
	const router = useRouter();
	const timerId = useRef<NodeJS.Timeout | null>(null);
	
	const isAdminPromise =  new Promise(resolve => {
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
			router.push('/')
		}
	});
	
  return (
    <div>
      Admin Page
    </div>
  )
}

export default AdminPage;