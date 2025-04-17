export type FetchFunction = {
  <T>(url: string, options?: RequestInit): Promise<T>
}
