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
    // Future contest related API calls can go here
};
