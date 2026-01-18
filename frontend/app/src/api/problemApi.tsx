import client from '../api/client';

export interface Problem {
    id: number;
    contest: number;
    index: string;
    points: number;
    rating: number;
    url: string;
    description_kr: string;
}

export const problemApi = {
    getProblemsByContest: async (contestId: string) => {
        const response = await client.get<Problem[]>(`/api/contests/problems/${contestId}/`);
        return response.data;
    }
};
