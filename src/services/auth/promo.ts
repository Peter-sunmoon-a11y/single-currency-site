import authAxiosInstance from "@/lib/authAxios";

import type { ApiResponse } from "@/types/auth";

export async function getCurrentPromo(): Promise<any> {
    const response = await authAxiosInstance.get("/Promo/getCurrentPromo");
    return response.data;
}

export async function checkDetailPromo(): Promise<any> {
    const response = await authAxiosInstance.get("/Promo/checkDetailPromo");
    return response.data;
}

export async function donDeal(don_record_id: string): Promise<any> {
    const response = await authAxiosInstance.post("/Don/deal", { don_record_id });
    return response.data;
}

export async function checkDonPromo(don_record_id: string): Promise<any> {
    const response = await authAxiosInstance.post("/Promo/checkDonPromo", { don_record_id });
    return response.data;
}

export async function getPromoByPage(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Promo/getPromoByPage", data);
    return response.data;
}

export async function getPromoByPageV2(data?: any): Promise<any> {
    const response = await authAxiosInstance.post("/Promo/getPromoByPage2", data);
    return response.data;
}

export async function choicePromo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Promo/choicePromo", data);
    return response.data;
}

  /**
   * 钱包设置中的法币列表
   */
