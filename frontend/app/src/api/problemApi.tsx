import client from '../api/client';

export interface Problem {
    id: number;
    contest: number;
    index: string;
    points: number;
    rating: number;
    url: string;
    description_kr: string;
    name: string;
}

export const problemApi = {
    getProblemsByContest: async (contestId: string) => {
        const response = await client.get<Problem[]>(`/api/contests/problems/${contestId}/`);
        return response.data;
    },
    getProblem: async (id: string | number) => {
        const response = await client.get<Problem>(`/api/contests/admin/problems/${id}/`);
        return response.data;
    },
    updateProblem: async (id: string | number, data: Partial<Problem>) => {
        const response = await client.patch<Problem>(`/api/contests/admin/problems/${id}/`, data);
        return response.data;
    },
    deleteProblem: async (id: string | number) => {
        const response = await client.delete(`/api/contests/admin/problems/${id}/`);
        return response.data;
    },
    getProblemDetail: async (contestId: string | number, problemId: string | number) => {
        const response = await client.get<Problem>(`/api/contests/problems/${contestId}/${problemId}/`);
        return response.data;
    }
};
