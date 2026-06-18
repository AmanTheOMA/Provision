type AxiosLike = {
  response?: {
    status?: number;
    data?: { error?: string; errors?: { msg: string }[] };
  };
  code?: string;
};

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const e = err as AxiosLike;

  if (!e?.response) {
    return "Network error. Please check your connection and try again.";
  }

  const { status, data } = e.response;

  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status !== undefined && status >= 500)
    return "A server error occurred. Please try again later.";

  return data?.error ?? data?.errors?.[0]?.msg ?? fallback;
}
