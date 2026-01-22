import client from '../api/client';

export interface Contest {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
}

interface ContestListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Contest[];
}

export const contestApi = {
    getAllContests: async () => {
        const response = await client.get<ContestListResponse>('/api/contests/contests/');
        return response.data.results;
    },
    getContestDetail: async (id: string | number) => {
        const response = await client.get<Contest>(`/api/contests/contests/${id}/`);
        return response.data;
    },
    deleteContest: async (id: string | number) => {
        const response = await client.delete(`/api/contests/admin/contests/${id}/`);
        return response.data;
    },
    getParticipants: async (contestId: string | number) => {
        const response = await client.get(`/api/contests/admin/participants/?contest=${contestId}`);
        return response.data.results;
    }
};
