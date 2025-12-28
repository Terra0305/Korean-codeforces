export interface Profile {
    school: string;
    department: string;
    student_id: string;
    real_name: string;
    codeforces_id: string;
    elo_rating: number;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
    profile: Profile;
}

export interface LoginResponse {
    message: string;
    user: User;
}

export interface ApiError {
    error: string;
}
