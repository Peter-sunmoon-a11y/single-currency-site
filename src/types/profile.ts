export interface KycDetail {
  id: number;
  team_id: number;
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  birthday: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
  document_type: number;
  document_url: string;
  status: number;
  created_at: number;
  updated_at: number;
  email: string;
  nickname: string;
  phone: string;
}
