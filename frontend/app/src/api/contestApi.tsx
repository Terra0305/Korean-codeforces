import client from '../api/client';

export interface Contest {
    id: number | null;
    virtual_id: string | null;
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
    getContestDetail: async (virtual_id: string | number) => {
        const response = await client.get<Contest>(`/api/contests/contests/${virtual_id}/`);
        return response.data;
    },
    updateContest: async (id: number | null, data: Partial<Contest>) => {
        const response = await client.patch(`/api/contests/admin/contests/${id}/`, data);
        return response.data;
    },
    deleteContest: async (id: number | null) => {
        const response = await client.delete(`/api/contests/admin/contests/${id}/`);
        return response.data;
    },
    getParticipants: async (virtual_id: string | null) => {
        const response = await client.get(`/api/contests/admin/participants/?virtual_id=${virtual_id}`);
        return response.data.results;
    }
};
