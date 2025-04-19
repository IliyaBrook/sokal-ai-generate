'use client'

import { isAllowedRoute } from '@/lib/isAllowedRoute'
import { IAuthResponse } from '@sokal_ai_generate/shared-types'

type authResponse = Omit<IAuthResponse, 'refreshToken'>;

interface IFetchWithRefresh {
	url: string;
	options?: RequestInit;
	onGetRefreshUserData?: (data: authResponse) => void;
}

export const fetchWithRefresh = async <T>({
	                                          url,
	                                          options = {},
	                                          onGetRefreshUserData
                                          }: IFetchWithRefresh): Promise<T> => {
	let token = localStorage.getItem('accessToken')
	return new Promise<T>((resolve, reject) => {
		if (token) {
			const defaultHeaders: Record<string, string> = {
				'Content-Type': 'application/json'
			}
			defaultHeaders['Authorization'] = `Bearer ${token}`
			let fetchOptions: RequestInit = {
				...options,
				headers: {
					...defaultHeaders,
					...((options.headers as Record<string, string>) || {})
				}
			}
			
			const fetchResponse = async () => fetch(url, fetchOptions)
				.then(response => {
					if (response.ok) {
						const responseClone = response.clone()
						responseClone.json().then(data => {
							resolve(data as T)
						})
						return
					}
					return response
				})
			return fetchResponse().then(response => {
					if (response && response.status === 401) {
						return fetch('/api/users/refresh').then(refreshResponse => {
							if (refreshResponse.ok) {
								const refreshResponseClone = refreshResponse.clone()
								return refreshResponseClone.json().then((refreshedData: authResponse) => {
									const accessToken = refreshedData.accessToken
									localStorage.setItem('accessToken', accessToken)
									console.log('typeof:', typeof onGetRefreshUserData, 'value:', onGetRefreshUserData)
									
									if (typeof onGetRefreshUserData === 'function' && onGetRefreshUserData) {
										onGetRefreshUserData(refreshedData)
									}
									console.log('refresh token success:')
									token = accessToken
									fetchOptions = {
										...options,
										headers: {
											...defaultHeaders,
											Authorization: `Bearer ${accessToken}`,
											...((options.headers as Record<string, string>) || {})
										}
									}
									return fetchResponse()
								})
							} else {
								throw new Error(`Cannot update refresh token: ${response.status}`)
							}
						})
					} else if (response) {
						throw new Error(`Refresh token error: ${response.status}`);
					}
				}).catch(error => {
					reject(error)
				})
		}else {
			if (!isAllowedRoute()) {
				reject(new Error('Not authorized'))
			}
		}
	})
}